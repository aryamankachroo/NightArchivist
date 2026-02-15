"""TwelveLabs client for video event extraction."""

import json
import os
from pathlib import Path

from twelvelabs import TwelveLabs
from twelvelabs.indexes import IndexesCreateRequestModelsItem

VIDEO_EVENTS_JSON_SCHEMA = {
    "type": "object",
    "properties": {
        "events": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "t_start": {"type": "string", "description": "Start time HH:MM:SS"},
                    "t_end": {"type": "string", "description": "End time HH:MM:SS"},
                    "description": {"type": "string", "description": "Event description"},
                },
                "required": ["t_start", "t_end", "description"],
            },
        }
    },
    "required": ["events"],
}

EXTRACT_EVENTS_PROMPT = """Extract all key events from this video with timestamps in chronological order.
For each event provide:
- t_start: Start time in HH:MM:SS format
- t_end: End time in HH:MM:SS format
- description: Brief description of what happened

Return ONLY a JSON object with an "events" array. No other text."""


def get_client() -> TwelveLabs:
    """Get TwelveLabs client with API key from env."""
    api_key = os.getenv("TWELVELABS_API_KEY")
    if not api_key:
        raise ValueError("TWELVELABS_API_KEY environment variable is required")
    return TwelveLabs(api_key=api_key)


def get_or_create_index(client: TwelveLabs) -> str:
    """Get index ID from env or create/find one."""
    index_id = os.getenv("TWELVELABS_INDEX_ID")
    if index_id:
        return index_id

    # Try to use first existing index with Pegasus (for analyze)
    try:
        pager = client.indexes.list()
        items = getattr(pager, "items", None) or list(pager)
        if items and items[0].id:
            return items[0].id
    except Exception:
        pass

    # Create new index with Pegasus for analysis
    index = client.indexes.create(
        index_name="night-archivist-mvp",
        models=[
            IndexesCreateRequestModelsItem(
                model_name="pegasus1.2",
                model_options=["visual", "audio"],
            ),
        ],
    )
    return index.id


def extract_video_events(video_path: Path, index_id: str | None = None) -> list[dict]:
    """
    Upload video to TwelveLabs, wait for indexing, then extract events.
    Returns list of {t_start, t_end, description}.
    """
    client = get_client()
    idx = index_id or get_or_create_index(client)

    # Create indexing task with video file
    with open(video_path, "rb") as f:
        task = client.tasks.create(index_id=idx, video_file=f)

    if not task.id or not task.video_id:
        raise RuntimeError("Failed to create TwelveLabs indexing task")

    # Wait for indexing to complete (poll every 5s, timeout ~5 min)
    completed = client.tasks.wait_for_done(
        task_id=task.id,
        sleep_interval=5.0,
    )

    if completed.status != "ready":
        raise RuntimeError(f"TwelveLabs indexing failed with status: {completed.status}")

    video_id = completed.video_id
    if not video_id:
        raise RuntimeError("No video_id after indexing")

    # Analyze video for events
    result = client.analyze(
        video_id=video_id,
        prompt=EXTRACT_EVENTS_PROMPT,
        temperature=0.2,
        response_format={
            "type": "json_schema",
            "json_schema": VIDEO_EVENTS_JSON_SCHEMA,
        },
    )

    if not result.data:
        return []

    try:
        parsed = json.loads(result.data)
        events = parsed.get("events", [])
        return [{"t_start": e["t_start"], "t_end": e["t_end"], "description": e["description"]} for e in events]
    except (json.JSONDecodeError, KeyError):
        return []
