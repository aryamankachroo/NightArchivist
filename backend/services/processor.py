"""Processing pipeline orchestrator."""

import json
import os
from pathlib import Path

from dotenv import load_dotenv

from storage import get_narration_path, get_result_path, get_text_path, get_video_path

from .elevenlabs_client import text_to_speech
from .twelvelabs_client import extract_video_events

# Ensure .env is loaded (critical for background thread)
_BACKEND_ENV = Path(__file__).resolve().parent.parent / ".env"


def _read_env_key(key: str) -> str:
    """Read a key from os.environ or directly from .env file."""
    val = (os.getenv(key) or "").strip()
    if not val and _BACKEND_ENV.exists():
        for line in _BACKEND_ENV.read_text(encoding="utf-8").splitlines():
            if line.strip().startswith(f"{key}="):
                val = line.split("=", 1)[1].strip().strip('"\'')
                break
    return val


def _get_fuse_fn():
    """Pick the best available LLM: DeepSeek > OpenAI > Gemini."""
    load_dotenv(dotenv_path=_BACKEND_ENV)

    # 1. DeepSeek (OpenAI-compatible)
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

    # 2. OpenAI
    openai_key = _read_env_key("OPENAI_API_KEY")
    if openai_key:
        os.environ["OPENAI_API_KEY"] = openai_key
        from .openai_client import fuse_evidence
        return fuse_evidence

    # 3. Gemini (fallback)
    from .gemini_client import fuse_evidence
    return fuse_evidence


def process_case(case_id: str, cases: dict) -> None:
    """
    Run the full processing pipeline for a case.
    Updates cases[case_id] state in place.
    """
    state = cases.get(case_id)
    if not state:
        return

    try:
        state.status = "processing"
        state.progress = 5
        state.current_step = "Uploading"
        state.error = None

        video_path = get_video_path(case_id)
        text_path = get_text_path(case_id)

        if not video_path or not video_path.exists():
            raise ValueError("Video file not found. Please upload video and text first.")

        # Step 1: Video Analysis (TwelveLabs)
        state.progress = 15
        state.current_step = "Video Analysis"
        video_events = extract_video_events(video_path)

        # Step 2: Reasoning (Gemini)
        state.progress = 50
        state.current_step = "Reasoning"
        text_content = ""
        if text_path and text_path.exists():
            text_content = text_path.read_text(encoding="utf-8", errors="replace")

        fuse_evidence_fn = _get_fuse_fn()
        result = fuse_evidence_fn(video_events, text_content)

        # Step 3: Narration Text (already in result from Gemini)
        state.progress = 75
        state.current_step = "Narration"
        narration_script = result.narration_script

        # Step 4: Narration Audio (ElevenLabs)
        narration_path = get_narration_path(case_id)
        text_to_speech(narration_script, narration_path)

        # Step 5: Save result.json (strip narration_script for API response, keep full for storage)
        result_path = get_result_path(case_id)
        result_dict = result.model_dump()
        # Keep narration_script in stored JSON for reference
        result_path.parent.mkdir(parents=True, exist_ok=True)
        result_path.write_text(json.dumps(result_dict, indent=2), encoding="utf-8")

        state.status = "completed"
        state.progress = 100
        state.current_step = "Complete"

    except Exception as e:
        state.status = "failed"
        state.error = str(e)
        state.current_step = "Failed"
