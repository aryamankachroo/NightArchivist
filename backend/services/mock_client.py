"""Mock client for demo mode - no external APIs required."""

import base64
from pathlib import Path

from models import (
    CaseResultWithNarration,
    CaseSummary,
    Contradiction,
    Entity,
    Event,
    OpenQuestion,
    TimelineEntry,
)


def get_mock_result(
    text_preview: str = "",
    video_events: list[dict] | None = None,
) -> CaseResultWithNarration:
    """Return a sample case result. Uses real video_events if provided for a more relevant output."""
    preview = (text_preview[:100] + "...") if len(text_preview) > 100 else text_preview or "uploaded evidence"

    # Build events/timeline from real video_events if available
    if video_events:
        events = [
            Event(
                id=f"EV{i+1}",
                t_start=e.get("t_start", "00:00:00"),
                t_end=e.get("t_end", "00:00:00"),
                description=e.get("description", "Event observed"),
                entities=[],
                evidence_refs=[f"video:{e.get('t_start', '')}-{e.get('t_end', '')}"],
                confidence=0.7,
            )
            for i, e in enumerate(video_events[:10])
        ]
        timeline = [
            TimelineEntry(time=e.get("t_start", "00:00:00"), event_id=f"EV{i+1}")
            for i, e in enumerate(video_events[:10])
        ]
    else:
        events = [
            Event(
                id="EV1",
                t_start="00:00:00",
                t_end="00:00:15",
                description="Initial activity observed in footage",
                entities=["E1"],
                evidence_refs=["video:00:00:00-00:00:15"],
                confidence=0.7,
            ),
            Event(
                id="EV2",
                t_start="00:00:15",
                t_end="00:00:30",
                description="Key moment captured",
                entities=["E1", "E2"],
                evidence_refs=["video:00:00:15-00:00:30", "text:L10-L15"],
                confidence=0.6,
            ),
        ]
        timeline = [
            TimelineEntry(time="00:00:00", event_id="EV1"),
            TimelineEntry(time="00:00:15", event_id="EV2"),
        ]
    one_liner = (
        f"Evidence analyzed: {len(video_events) if video_events else 2} video events, text sample: {preview}"
        if video_events or preview
        else "Evidence under review. Mock output for demo."
    )

    return CaseResultWithNarration(
        case_summary=CaseSummary(
            one_liner=one_liner,
            confidence=0.6,
        ),
        entities=[
            Entity(id="E1", type="person", name="Unknown Subject", evidence_refs=["text:L1-L5"]),
            Entity(id="E2", type="place", name="Scene of investigation", evidence_refs=["video:00:00:00-00:00:30"]),
        ],
        events=events,
        timeline=timeline,
        contradictions=[
            Contradiction(
                description="Timeline in text conflicts with video timestamps",
                evidence_refs=["text:L20-L25", "video:00:01:00-00:01:30"],
            ),
        ],
        open_questions=[
            OpenQuestion(
                question="What was the motive?",
                what_evidence_needed="Additional witness statements or documents",
            ),
        ],
        narration_script="""The rain fell on the city like it had somewhere to be. Another case, another stack of evidence. 
        The video told one story. The documents told another. In this business, the truth's always hiding in the cracks. 
        What we've got so far: activity at the scene, a key moment captured. But the timeline doesn't add up. 
        Somebody's lying. Or somebody's memory's gone fuzzy. Until we get more evidence, this one stays open. 
        Demo mode — Night Archivist.""",
    )


def get_mock_video_events() -> list[dict]:
    """Return mock video events when TwelveLabs is unavailable."""
    return [
        {"t_start": "00:00:00", "t_end": "00:00:15", "description": "Initial scene, subject enters frame"},
        {"t_start": "00:00:15", "t_end": "00:00:30", "description": "Key interaction observed"},
        {"t_start": "00:00:30", "t_end": "00:01:00", "description": "Subject exits frame"},
    ]


# Minimal valid silent MP3 (~200 bytes)
_SILENT_MP3_B64 = "SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU2LjM2LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV6urq6urq6urq6urq6urq6urq6urq6urq6v////////////////////////////////8AAAAATGF2YzU2LjQxAAAAAAAAAAAAAAAAJAAAAAAAAAAAASDs90hvAAAAAAAAAAAAAAAAAAAA//MUZAAAAAGkAAAAAAAAA0gAAAAATEFN//MUZAMAAAGkAAAAAAAAA0gAAAAARTMu//MUZAYAAAGkAAAAAAAAA0gAAAAAOTku//MUZAkAAAGkAAAAAAAAA0gAAAAANVVV"


def write_placeholder_mp3(output_path: Path) -> Path:
    """Write a minimal silent MP3 for demo mode when ElevenLabs is unavailable."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_bytes(base64.b64decode(_SILENT_MP3_B64))
    return output_path
