"""Quick smoke-test for the rule-based analysis engine."""

import json
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from services.rule_based_client import fuse_evidence

# --- Sample data ---
VIDEO_EVENTS = [
    {"t_start": "00:00:00", "t_end": "00:00:15", "description": "Three people seated around a table, each engaged in different activities"},
    {"t_start": "00:00:15", "t_end": "00:00:30", "description": "Person on the left holds a can, center person focused on laptop"},
    {"t_start": "00:00:30", "t_end": "00:01:00", "description": "Person on the right is holding a phone, conversation begins"},
]

TEXT_CONTENT = """Case Notes - Night Archivist Investigation
Date: February 14, 2026

At 9:30 PM, Detective Sarah Mitchell arrived at the warehouse on 5th Street.
She observed three individuals: John Carter, Maria Lopez, and an unidentified male.

John Carter was seen entering the building at approximately 9:15 PM.
Maria Lopez arrived at 9:22 PM via the back alley entrance.
The unidentified male was already inside when both arrived.

At 9:45 PM, a loud noise was reported by neighbors on Baker Street.
Officer James Park responded to the call at 9:52 PM.

Key observations:
- Surveillance footage shows Carter carrying a briefcase
- Lopez appeared nervous during the encounter  
- The unidentified male left through the parking lot at 10:05 PM

Witness statement from Robert Chen (building security):
"I saw them arrive separately. Carter came through the front, Lopez through the back.
The third person was already there when my shift started at 8:00 PM."
"""

print("=" * 60)
print("RULE-BASED ANALYSIS ENGINE TEST")
print("=" * 60)

result = fuse_evidence(VIDEO_EVENTS, TEXT_CONTENT)

print("\n--- CASE SUMMARY ---")
print(f"  {result.case_summary.one_liner}")
print(f"  Confidence: {result.case_summary.confidence}")

print(f"\n--- ENTITIES ({len(result.entities)}) ---")
for e in result.entities:
    print(f"  [{e.type}] {e.name} (refs: {e.evidence_refs})")

print(f"\n--- EVENTS ({len(result.events)}) ---")
for ev in result.events:
    print(f"  {ev.t_start} - {ev.t_end}: {ev.description[:80]}...")
    print(f"    source: {ev.evidence_refs}, confidence: {ev.confidence}")

print(f"\n--- TIMELINE ({len(result.timeline)}) ---")
for t in result.timeline:
    print(f"  {t.time} -> {t.event_id}")

print(f"\n--- CONTRADICTIONS ({len(result.contradictions)}) ---")
for c in result.contradictions:
    print(f"  {c.description}")
    print(f"    refs: {c.evidence_refs}")

print(f"\n--- OPEN QUESTIONS ({len(result.open_questions)}) ---")
for q in result.open_questions:
    print(f"  Q: {q.question}")
    print(f"  Needed: {q.what_evidence_needed}")

print(f"\n--- NARRATION ---")
print(result.narration_script)

print("\n" + "=" * 60)
print("JSON output (first 500 chars):")
print(json.dumps(result.model_dump(), indent=2)[:500] + "...")
print("=" * 60)
print("\nSUCCESS - Rule-based engine works!")
