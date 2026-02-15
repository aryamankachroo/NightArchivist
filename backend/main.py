"""Night Archivist - FastAPI backend."""

import json
import os
import threading
import uuid
from pathlib import Path

from dotenv import load_dotenv

# Load .env from backend directory (works regardless of CWD)
_env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=_env_path)
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from models import CaseState, CreateCaseResponse, StatusResponse
from services.processor import process_case
from storage import (
    ALLOWED_TEXT_EXTENSIONS,
    ALLOWED_VIDEO_EXTENSIONS,
    ensure_case_dir,
    get_narration_path,
    get_result_path,
    get_text_path,
    get_video_path,
)


# In-memory case state
cases: dict[str, CaseState] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_case_dir("_")  # Ensure data root exists
    yield


app = FastAPI(title="Night Archivist", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/cases", response_model=CreateCaseResponse)
async def create_case():
    """Create a new case and return its ID."""
    case_id = str(uuid.uuid4())
    ensure_case_dir(case_id)
    cases[case_id] = CaseState(status="pending", current_step="Created")
    return CreateCaseResponse(case_id=case_id)


@app.post("/cases/{case_id}/upload")
async def upload_files(
    case_id: str,
    video: UploadFile = File(...),
    text: UploadFile = File(...),
):
    """Upload video and text evidence for a case."""
    if case_id not in cases:
        raise HTTPException(status_code=404, detail="Case not found")

    # Validate video
    video_ext = "." + (video.filename or "").rsplit(".", 1)[-1].lower()
    if video_ext not in ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid video format. Allowed: {', '.join(ALLOWED_VIDEO_EXTENSIONS)}",
        )

    # Validate text
    text_ext = "." + (text.filename or "").rsplit(".", 1)[-1].lower()
    if text_ext not in ALLOWED_TEXT_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Invalid text format. Use .txt file.",
        )

    case_dir = ensure_case_dir(case_id)

    # Save video as video.{ext}
    video_content = await video.read()
    video_path = case_dir / f"video{video_ext}"
    video_path.write_bytes(video_content)

    # Save text as text.txt
    text_content = await text.read()
    (case_dir / "text.txt").write_bytes(text_content)

    cases[case_id].current_step = "Uploaded"
    return {"status": "ok", "message": "Files uploaded successfully"}


@app.post("/cases/{case_id}/process")
async def start_process(case_id: str):
    """Start background processing pipeline."""
    if case_id not in cases:
        raise HTTPException(status_code=404, detail="Case not found")

    video_path = get_video_path(case_id)
    text_path = get_text_path(case_id)
    if not video_path or not video_path.exists():
        raise HTTPException(status_code=400, detail="Video file not found. Upload video and text first.")
    if not text_path or not text_path.exists():
        raise HTTPException(status_code=400, detail="Text file not found. Upload video and text first.")

    thread = threading.Thread(target=process_case, args=(case_id, cases))
    thread.start()
    return {"status": "accepted", "message": "Processing started"}


@app.get("/cases/{case_id}/status", response_model=StatusResponse)
async def get_status(case_id: str):
    """Get case processing status."""
    if case_id not in cases:
        raise HTTPException(status_code=404, detail="Case not found")
    state = cases[case_id]
    return StatusResponse(
        status=state.status,
        progress=state.progress,
        current_step=state.current_step,
        error=state.error,
    )


@app.get("/cases/{case_id}/result")
async def get_result(case_id: str):
    """Get case result JSON and narration URL."""
    if case_id not in cases:
        raise HTTPException(status_code=404, detail="Case not found")
    if cases[case_id].status != "completed":
        raise HTTPException(status_code=400, detail="Case not yet completed")

    result_path = get_result_path(case_id)
    if not result_path.exists():
        raise HTTPException(status_code=404, detail="Result not found")

    data = json.loads(result_path.read_text(encoding="utf-8"))
    base_url = os.getenv("BACKEND_URL", "http://localhost:8000")
    data["narration_url"] = f"{base_url}/cases/{case_id}/narration"
    return data


@app.get("/cases/{case_id}/narration")
async def get_narration(case_id: str):
    """Stream narration MP3 file."""
    if case_id not in cases:
        raise HTTPException(status_code=404, detail="Case not found")

    narration_path = get_narration_path(case_id)
    if not narration_path.exists():
        raise HTTPException(status_code=404, detail="Narration not yet generated")

    return FileResponse(
        narration_path,
        media_type="audio/mpeg",
        filename="narration.mp3",
    )
