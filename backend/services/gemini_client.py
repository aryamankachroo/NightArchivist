"""Gemini client for evidence fusion and structured output."""

import json
import os
from pathlib import Path

import google.generativeai as genai
from dotenv import load_dotenv

# Ensure .env is loaded (in case called from worker thread before main)
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

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


def _get_api_key() -> str:
    """Load and validate API key from .env."""
    api_key = (os.getenv("GEMINI_API_KEY") or "").strip()
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is required")
    return api_key


def fuse_evidence(video_events: list[dict], text_content: str) -> CaseResultWithNarration:
    """
    Combine video events and text evidence using Gemini.
    Returns structured CaseResultWithNarration including narration_script for ElevenLabs.
    Uses google-generativeai package with genai.configure(api_key=...).
    """
    api_key = _get_api_key()
    genai.configure(api_key=api_key)

    video_events_json = json.dumps(video_events, indent=2)
    full_prompt = f"{GEMINI_SYSTEM_PROMPT}\n\n{GEMINI_USER_PROMPT_TEMPLATE.format(video_events_json=video_events_json, text_content=text_content or '(No text evidence provided)')}"

    schema = _build_flat_schema()

    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        generation_config={
            "response_mime_type": "application/json",
            "response_schema": schema,
        },
    )

    response = model.generate_content(full_prompt)

    if not response.text:
        raise RuntimeError("Gemini returned empty response")

    try:
        data = json.loads(response.text)
        return CaseResultWithNarration.model_validate(data)
    except Exception as e:
        raise RuntimeError(f"Failed to parse Gemini response: {e}") from e


def _build_flat_schema() -> dict:
    """Build JSON schema for Gemini (flattened to avoid $ref issues)."""
    return {
        "type": "object",
        "properties": {
            "case_summary": {
                "type": "object",
                "properties": {
                    "one_liner": {"type": "string"},
                    "confidence": {"type": "number"},
                },
                "required": ["one_liner", "confidence"],
            },
            "entities": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string"},
                        "type": {"type": "string", "enum": ["person", "place", "object"]},
                        "name": {"type": "string"},
                        "evidence_refs": {"type": "array", "items": {"type": "string"}},
                    },
                    "required": ["id", "type", "name", "evidence_refs"],
                },
            },
            "events": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string"},
                        "t_start": {"type": "string"},
                        "t_end": {"type": "string"},
                        "description": {"type": "string"},
                        "entities": {"type": "array", "items": {"type": "string"}},
                        "evidence_refs": {"type": "array", "items": {"type": "string"}},
                        "confidence": {"type": "number"},
                    },
                    "required": ["id", "t_start", "t_end", "description", "entities", "evidence_refs", "confidence"],
                },
            },
            "timeline": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {"time": {"type": "string"}, "event_id": {"type": "string"}},
                    "required": ["time", "event_id"],
                },
            },
            "contradictions": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "description": {"type": "string"},
                        "evidence_refs": {"type": "array", "items": {"type": "string"}},
                    },
                    "required": ["description", "evidence_refs"],
                },
            },
            "open_questions": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "question": {"type": "string"},
                        "what_evidence_needed": {"type": "string"},
                    },
                    "required": ["question", "what_evidence_needed"],
                },
            },
            "narration_script": {"type": "string"},
        },
        "required": [
            "case_summary",
            "entities",
            "events",
            "timeline",
            "contradictions",
            "open_questions",
            "narration_script",
        ],
    }
