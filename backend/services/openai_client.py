"""OpenAI client for evidence fusion (alternative to Gemini)."""

import json
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

from models import CaseResultWithNarration

SYSTEM_PROMPT = """You are an investigative analyst. Combine video evidence and text evidence into a structured case report.

SAFETY RULES - STRICTLY ENFORCED:
- Use ONLY the provided evidence. Do not invent or guess facts.
- If something is unknown or uncertain, use "unknown".
- Do not infer protected attributes (race, religion, etc.).
- Evidence references: use "video:HH:MM:SS-HH:MM:SS" for video segments, "text:L<line>" for text.
- All times must be in HH:MM:SS format.

Output valid JSON only, no markdown or extra text."""

USER_PROMPT_TEMPLATE = """Video events (from video analysis):
{video_events_json}

Text evidence:
{text_content}

Produce a structured case report as JSON with these exact keys:
- case_summary: {{"one_liner": "...", "confidence": 0.0-1.0}}
- entities: [{{"id":"E1","type":"person|place|object","name":"...","evidence_refs":[]}}]
- events: [{{"id":"EV1","t_start":"HH:MM:SS","t_end":"HH:MM:SS","description":"...","entities":[],"evidence_refs":[],"confidence":0.0}}]
- timeline: [{{"time":"HH:MM:SS","event_id":"EV1"}}]
- contradictions: [{{"description":"...","evidence_refs":[]}}]
- open_questions: [{{"question":"...","what_evidence_needed":"..."}}]
- narration_script: A noir detective-style narration (90-120 seconds when read aloud) summarizing the case. Use dramatic, hardboiled tone. State ONLY facts from the evidence."""


def fuse_evidence(
    video_events: list[dict],
    text_content: str,
    api_key: str | None = None,
    base_url: str | None = None,
    model: str | None = None,
) -> CaseResultWithNarration:
    """Combine video events and text evidence using OpenAI-compatible API (OpenAI, DeepSeek, etc.)."""
    from openai import OpenAI

    api_key = api_key or (os.getenv("OPENAI_API_KEY") or "").strip()
    if not api_key:
        raise ValueError("API key is required")

    client = OpenAI(api_key=api_key, base_url=base_url)

    video_events_json = json.dumps(video_events, indent=2)
    user_content = USER_PROMPT_TEMPLATE.format(
        video_events_json=video_events_json,
        text_content=text_content or "(No text evidence provided)",
    )

    response = client.chat.completions.create(
        model=model or "gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )

    raw = response.choices[0].message.content
    if not raw:
        raise RuntimeError("LLM returned empty response")

    # Handle markdown code blocks if present
    if raw.strip().startswith("```"):
        lines = raw.strip().split("\n")
        raw = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

    try:
        data = json.loads(raw)
        return CaseResultWithNarration.model_validate(data)
    except Exception as e:
        raise RuntimeError(f"Failed to parse LLM response: {e}") from e
