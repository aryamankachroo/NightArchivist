"""Gemini client for evidence fusion. Uses NEW google-genai SDK with explicit key."""

import json
from pathlib import Path

from dotenv import load_dotenv

# Load .env from backend dir
_ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=_ENV_PATH)

from models import CaseResultWithNarration

GEMINI_SYSTEM_PROMPT = """You are an investigative analyst. Combine video evidence and text evidence into a structured case report.

SAFETY RULES - STRICTLY ENFORCED:
- Use ONLY the provided evidence. Do not invent or guess facts.
- If something is unknown or uncertain, use "unknown".
- Do not infer protected attributes (race, religion, etc.).
- Evidence references: use "video:HH:MM:SS-HH:MM:SS" for video segments, "text:L<line>" for text.
- All times must be in HH:MM:SS format.
"""

GEMINI_USER_PROMPT_TEMPLATE = """Video events (from video analysis):
{video_events_json}

Text evidence:
{text_content}

Produce a structured case report as JSON. Include:
1. case_summary: one_liner (brief summary), confidence (0-1)
2. entities: list of {{id, type: "person"|"place"|"object", name, evidence_refs}}
3. events: list of {{id, t_start, t_end, description, entities, evidence_refs, confidence}}
4. timeline: list of {{time, event_id}} in chronological order
5. contradictions: list of {{description, evidence_refs}} for conflicting evidence
6. open_questions: list of {{question, what_evidence_needed}}
7. narration_script: A noir detective-style narration (90-120 seconds when read aloud) summarizing the case. Use dramatic, hardboiled tone. State ONLY facts from the evidence. Do not add new information.
"""


def _read_api_key() -> str:
    """Read GEMINI_API_KEY directly from .env file to avoid env var interference."""
    key = ""
    if _ENV_PATH.exists():
        for line in _ENV_PATH.read_text(encoding="utf-8").splitlines():
            s = line.strip()
            if s.startswith("GEMINI_API_KEY="):
                key = line.split("=", 1)[1].strip().strip('"\'')
                break
    if not key:
        import os
        key = (os.getenv("GEMINI_API_KEY") or "").strip()
    if not key:
        raise ValueError("GEMINI_API_KEY not found in .env or environment")
    return key


def fuse_evidence(video_events: list[dict], text_content: str) -> CaseResultWithNarration:
    """
    Combine video events and text evidence using Gemini.
    Uses google-genai (new SDK) with explicit api_key - no env var dependency.
    """
    api_key = _read_api_key()

    # Try NEW google-genai SDK first (recommended)
    try:
        return _fuse_with_new_sdk(api_key, video_events, text_content)
    except ImportError:
        pass
    except Exception as e:
        if "API key" in str(e) or "invalid" in str(e).lower() or "401" in str(e) or "403" in str(e):
            raise  # Re-raise auth errors
        raise

    # Fallback: deprecated google-generativeai
    return _fuse_with_legacy_sdk(api_key, video_events, text_content)


def _fuse_with_new_sdk(api_key: str, video_events: list[dict], text_content: str) -> CaseResultWithNarration:
    """Use google-genai (new SDK)."""
    from google import genai

    client = genai.Client(api_key=api_key)

    video_events_json = json.dumps(video_events, indent=2)
    full_prompt = GEMINI_USER_PROMPT_TEMPLATE.format(
        video_events_json=video_events_json,
        text_content=text_content or "(No text evidence provided)",
    )

    schema = _build_flat_schema()

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=f"{GEMINI_SYSTEM_PROMPT}\n\n{full_prompt}",
        config={
            "response_mime_type": "application/json",
            "response_json_schema": schema,
        },
    )

    raw = response.text if hasattr(response, "text") and response.text else ""
    if not raw:
        raise RuntimeError("Gemini returned empty response")

    data = json.loads(raw)
    return CaseResultWithNarration.model_validate(data)


def _fuse_with_legacy_sdk(api_key: str, video_events: list[dict], text_content: str) -> CaseResultWithNarration:
    """Use google-generativeai (deprecated)."""
    import os
    # Clear any conflicting env so configure uses our key
    os.environ.pop("GOOGLE_API_KEY", None)
    os.environ["GEMINI_API_KEY"] = api_key

    import google.generativeai as genai
    genai.configure(api_key=api_key)

    video_events_json = json.dumps(video_events, indent=2)
    full_prompt = f"{GEMINI_SYSTEM_PROMPT}\n\n{GEMINI_USER_PROMPT_TEMPLATE.format(video_events_json=video_events_json, text_content=text_content or '(No text evidence provided)')}"

    schema = _build_flat_schema()
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        generation_config={"response_mime_type": "application/json", "response_schema": schema},
    )
    response = model.generate_content(full_prompt)

    if not response.text:
        raise RuntimeError("Gemini returned empty response")

    data = json.loads(response.text)
    return CaseResultWithNarration.model_validate(data)


def _build_flat_schema() -> dict:
    """Build JSON schema for Gemini."""
    return {
        "type": "object",
        "properties": {
            "case_summary": {"type": "object", "properties": {"one_liner": {"type": "string"}, "confidence": {"type": "number"}}, "required": ["one_liner", "confidence"]},
            "entities": {"type": "array", "items": {"type": "object", "properties": {"id": {"type": "string"}, "type": {"type": "string", "enum": ["person", "place", "object"]}, "name": {"type": "string"}, "evidence_refs": {"type": "array", "items": {"type": "string"}}}, "required": ["id", "type", "name", "evidence_refs"]}},
            "events": {"type": "array", "items": {"type": "object", "properties": {"id": {"type": "string"}, "t_start": {"type": "string"}, "t_end": {"type": "string"}, "description": {"type": "string"}, "entities": {"type": "array", "items": {"type": "string"}}, "evidence_refs": {"type": "array", "items": {"type": "string"}}, "confidence": {"type": "number"}}, "required": ["id", "t_start", "t_end", "description", "entities", "evidence_refs", "confidence"]}},
            "timeline": {"type": "array", "items": {"type": "object", "properties": {"time": {"type": "string"}, "event_id": {"type": "string"}}, "required": ["time", "event_id"]}},
            "contradictions": {"type": "array", "items": {"type": "object", "properties": {"description": {"type": "string"}, "evidence_refs": {"type": "array", "items": {"type": "string"}}}, "required": ["description", "evidence_refs"]}},
            "open_questions": {"type": "array", "items": {"type": "object", "properties": {"question": {"type": "string"}, "what_evidence_needed": {"type": "string"}}, "required": ["question", "what_evidence_needed"]}},
            "narration_script": {"type": "string"},
        },
        "required": ["case_summary", "entities", "events", "timeline", "contradictions", "open_questions", "narration_script"],
    }
