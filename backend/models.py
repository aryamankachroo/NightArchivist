"""Pydantic models for API and Gemini structured output."""

from typing import Literal

from pydantic import BaseModel, Field


# --- Case state (in-memory) ---


class CaseState(BaseModel):
    status: Literal["pending", "processing", "completed", "failed"] = "pending"
    progress: int = Field(ge=0, le=100, default=0)
    current_step: str = ""
    error: str | None = None


# --- API responses ---


class CreateCaseResponse(BaseModel):
    case_id: str


class StatusResponse(BaseModel):
    status: str
    progress: int
    current_step: str
    error: str | None = None


# --- Gemini output schema ---


class CaseSummary(BaseModel):
    one_liner: str
    confidence: float


class Entity(BaseModel):
    id: str
    type: Literal["person", "place", "object"]
    name: str
    evidence_refs: list[str] = Field(default_factory=list)


class Event(BaseModel):
    id: str
    t_start: str  # HH:MM:SS
    t_end: str
    description: str
    entities: list[str] = Field(default_factory=list)
    evidence_refs: list[str] = Field(default_factory=list)
    confidence: float


class TimelineEntry(BaseModel):
    time: str
    event_id: str


class Contradiction(BaseModel):
    description: str
    evidence_refs: list[str] = Field(default_factory=list)


class OpenQuestion(BaseModel):
    question: str
    what_evidence_needed: str


class CaseResult(BaseModel):
    case_summary: CaseSummary
    entities: list[Entity]
    events: list[Event]
    timeline: list[TimelineEntry]
    contradictions: list[Contradiction]
    open_questions: list[OpenQuestion]


class CaseResultWithNarration(BaseModel):
    """Extended result with narration script for ElevenLabs."""
    case_summary: CaseSummary
    entities: list[Entity]
    events: list[Event]
    timeline: list[TimelineEntry]
    contradictions: list[Contradiction]
    open_questions: list[OpenQuestion]
    narration_script: str
