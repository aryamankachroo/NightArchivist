"""Processing pipeline orchestrator."""

import json
import os
from pathlib import Path

from dotenv import load_dotenv

from storage import get_narration_path, get_result_path, get_text_path, get_video_path

from .elevenlabs_client import text_to_speech
from .mock_client import get_mock_result, get_mock_video_events, write_placeholder_mp3
from .rule_based_client import fuse_evidence as rule_based_fuse
from .twelvelabs_client import extract_video_events

# Ensure .env is loaded (critical for background thread)
_BACKEND_ENV = Path(__file__).resolve().parent.parent / ".env"


def _is_demo_mode() -> bool:
    val = _read_env_key("DEMO_MODE").strip().lower()
    return val in ("1", "true", "yes", "on")


def _is_mock_llm_only() -> bool:
    """Use real TwelveLabs + ElevenLabs, but mock the LLM (Gemini) step."""
    val = _read_env_key("MOCK_LLM_ONLY").strip().lower()
    return val in ("1", "true", "yes", "on")


def _read_env_key(key: str) -> str:
    """Read a key from os.environ or directly from .env file."""
    load_dotenv(dotenv_path=_BACKEND_ENV)
    val = (os.getenv(key) or "").strip()
    if not val and _BACKEND_ENV.exists():
        for line in _BACKEND_ENV.read_text(encoding="utf-8").splitlines():
            if line.strip().startswith(f"{key}="):
                val = line.split("=", 1)[1].strip().strip('"\'')
                break
    return val


def _use_llm() -> bool:
    """Return True only if the user explicitly opts in to an LLM."""
    val = _read_env_key("USE_LLM").strip().lower()
    return val in ("1", "true", "yes", "on")


def _get_fuse_fn():
    """Pick the analysis engine.

    Default: rule-based (no LLM, deterministic, fast, no API key needed).
    Set USE_LLM=true in .env to try LLMs instead (Gemini/DeepSeek/OpenAI/Ollama).
    """
    if not _use_llm():
        # Default: rule-based deterministic analysis
        return rule_based_fuse

    # --- LLM path (opt-in) ---
    load_dotenv(dotenv_path=_BACKEND_ENV)

    use_gemini = _read_env_key("USE_GEMINI").strip().lower() in ("1", "true", "yes", "on")

    # 0. Gemini first when USE_GEMINI=true
    if use_gemini and _read_env_key("GEMINI_API_KEY"):
        from .gemini_client import fuse_evidence
        return fuse_evidence

    # 1. Ollama (local, free)
    ollama_url = (_read_env_key("OLLAMA_BASE_URL") or os.getenv("OLLAMA_BASE_URL") or "").strip()
    if ollama_url:
        from .openai_client import fuse_evidence
        def _ollama(video_events, text_content):
            return fuse_evidence(
                video_events, text_content,
                api_key="ollama",
                base_url=ollama_url if "/v1" in ollama_url else ollama_url.rstrip("/") + "/v1",
                model=os.getenv("OLLAMA_MODEL", "llama3.2"),
            )
        return _ollama

    # 2. DeepSeek
    deepseek_key = _read_env_key("DEEPSEEK_API_KEY")
    if deepseek_key:
        from .openai_client import fuse_evidence
        def _deepseek(video_events, text_content):
            return fuse_evidence(
                video_events, text_content,
                api_key=deepseek_key,
                base_url="https://api.deepseek.com",
                model="deepseek-chat",
            )
        return _deepseek

    # 3. OpenAI
    openai_key = _read_env_key("OPENAI_API_KEY")
    if openai_key:
        os.environ["OPENAI_API_KEY"] = openai_key
        from .openai_client import fuse_evidence
        return fuse_evidence

    # 4. Gemini (fallback)
    from .gemini_client import fuse_evidence
    return fuse_evidence


def process_case(case_id: str, cases: dict) -> None:
    """
    Run the full processing pipeline for a case.
    Updates cases[case_id] state in place.
    DEMO_MODE=true: skips all external APIs, uses mock data.
    """
    state = cases.get(case_id)
    if not state:
        return

    demo = _is_demo_mode()
    mock_llm = _is_mock_llm_only()
    
    print(f"\n{'='*60}")
    print(f"[{case_id}] Starting case processing")
    print(f"[{case_id}] DEMO_MODE={demo}, MOCK_LLM_ONLY={mock_llm}")
    print(f"{'='*60}\n")

    try:
        state.status = "processing"
        state.progress = 5
        state.current_step = "Uploading"
        state.error = None

        video_path = get_video_path(case_id)
        text_path = get_text_path(case_id)

        if not video_path or not video_path.exists():
            raise ValueError("Video file not found. Please upload video and text first.")

        text_content = ""
        if text_path and text_path.exists():
            text_content = text_path.read_text(encoding="utf-8", errors="replace")

        # Step 1: Video Analysis (real TwelveLabs unless full demo)
        state.progress = 15
        state.current_step = "Video Analysis"
        if demo:
            print(f"[{case_id}] Using mock video events (DEMO_MODE)")
            video_events = get_mock_video_events()
        else:
            print(f"[{case_id}] Calling TwelveLabs for video analysis...")
            video_events = extract_video_events(video_path)
            print(f"[{case_id}] TwelveLabs returned {len(video_events)} events")

        # Step 2: Reasoning (real LLM unless demo or MOCK_LLM_ONLY)
        state.progress = 50
        state.current_step = "Reasoning"
        if demo or mock_llm:
            print(f"[{case_id}] Using mock analysis result")
            result = get_mock_result(text_preview=text_content, video_events=video_events)
        else:
            fuse_evidence_fn = _get_fuse_fn()
            print(f"[{case_id}] Running analysis engine: {fuse_evidence_fn.__name__}")
            result = fuse_evidence_fn(video_events, text_content)
            print(f"[{case_id}] Analysis complete: {len(result.events)} events, {len(result.entities)} entities")

        # Step 3 & 4: Narration (real ElevenLabs unless full demo)
        state.progress = 75
        state.current_step = "Narration"
        narration_path = get_narration_path(case_id)
        if demo:
            write_placeholder_mp3(narration_path)
        else:
            try:
                print(f"[{case_id}] Calling ElevenLabs for narration...")
                text_to_speech(result.narration_script, narration_path)
                print(f"[{case_id}] ElevenLabs narration completed: {narration_path}")
            except Exception as e:
                print(f"[{case_id}] ElevenLabs FAILED: {e}")
                import traceback
                traceback.print_exc()
                write_placeholder_mp3(narration_path)  # fallback if ElevenLabs fails

        # Step 5: Save result.json
        result_path = get_result_path(case_id)
        result_dict = result.model_dump()
        result_path.parent.mkdir(parents=True, exist_ok=True)
        result_path.write_text(json.dumps(result_dict, indent=2), encoding="utf-8")

        state.status = "completed"
        state.progress = 100
        state.current_step = "Complete"
        print(f"\n[{case_id}] ✓ Processing COMPLETED successfully\n")

    except Exception as e:
        print(f"\n[{case_id}] ✗ Processing FAILED: {e}\n")
        import traceback
        traceback.print_exc()
        state.status = "failed"
        state.error = str(e)
        state.current_step = "Failed"
