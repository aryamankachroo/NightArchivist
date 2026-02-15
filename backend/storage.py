"""Local filesystem storage for case data."""

import os
from pathlib import Path

DATA_ROOT = Path(__file__).resolve().parent.parent / "data"
CASES_DIR = DATA_ROOT / "cases"

ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm"}
ALLOWED_TEXT_EXTENSIONS = {".txt"}


def ensure_case_dir(case_id: str) -> Path:
    """Create case directory if it doesn't exist. Return path."""
    path = CASES_DIR / case_id
    path.mkdir(parents=True, exist_ok=True)
    return path


def get_case_dir(case_id: str) -> Path:
    """Return path to case directory."""
    return CASES_DIR / case_id


def save_file(case_id: str, filename: str, content: bytes) -> Path:
    """Save file content to case directory. Return full path."""
    case_dir = ensure_case_dir(case_id)
    file_path = case_dir / filename
    file_path.write_bytes(content)
    return file_path


def load_file(case_id: str, filename: str) -> bytes:
    """Load file content from case directory."""
    file_path = get_case_dir(case_id) / filename
    return file_path.read_bytes()


def file_exists(case_id: str, filename: str) -> bool:
    """Check if file exists in case directory."""
    return (get_case_dir(case_id) / filename).exists()


def get_video_path(case_id: str) -> Path | None:
    """Return path to video file if it exists."""
    case_dir = get_case_dir(case_id)
    if not case_dir.exists():
        return None
    for ext in ALLOWED_VIDEO_EXTENSIONS:
        for f in case_dir.glob(f"video{ext}"):
            return f
        for f in case_dir.glob(f"*{ext}"):
            return f
    return None


def get_text_path(case_id: str) -> Path | None:
    """Return path to text file if it exists."""
    path = get_case_dir(case_id) / "text.txt"
    return path if path.exists() else None


def get_result_path(case_id: str) -> Path:
    """Return path to result.json."""
    return get_case_dir(case_id) / "result.json"


def get_narration_path(case_id: str) -> Path:
    """Return path to narration.mp3."""
    return get_case_dir(case_id) / "narration.mp3"
