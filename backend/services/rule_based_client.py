"""Rule-based Deterministic Archivist - no LLM required.

Parses text evidence with regex/heuristics, merges with video events,
builds structured timeline, and generates noir-style narration from templates.
"""

import re
from collections import Counter

from models import (
    CaseResultWithNarration,
    CaseSummary,
    Contradiction,
    Entity,
    Event,
    OpenQuestion,
    TimelineEntry,
)

# --- Regex patterns ---

TIME_PATTERN = re.compile(
    r"\b(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AaPp][Mm])?)\b"
)
# Capitalized multi-word names (2+ capitalized words in a row)
NAME_PATTERN = re.compile(r"\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)\b")
# Single capitalized word (potential name/entity, excluding common words)
SINGLE_NAME_PATTERN = re.compile(r"\b([A-Z][a-z]{2,})\b")

LOCATION_KEYWORDS = {
    "street", "road", "avenue", "alley", "park", "building", "warehouse",
    "office", "apartment", "house", "room", "bar", "club", "restaurant",
    "hotel", "station", "corner", "bridge", "dock", "pier", "garage",
    "lot", "parking", "store", "shop", "block", "district", "north",
    "south", "east", "west", "downtown", "uptown", "floor", "basement",
}

COMMON_WORDS = {
    "The", "This", "That", "Then", "There", "They", "These", "Those",
    "When", "Where", "What", "Which", "While", "With", "From", "Into",
    "About", "After", "Before", "Between", "During", "Under", "Over",
    "Also", "However", "Although", "Because", "Since", "Until", "Once",
    "Here", "Just", "Very", "Still", "Even", "Much", "Most", "Many",
    "Some", "Each", "Every", "Both", "Either", "Neither", "Other",
    "Another", "Such", "Same", "Next", "Last", "First", "Second",
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
    "Sunday", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
    # Title / document boilerplate words
    "Case", "Notes", "Report", "Summary", "Evidence", "Investigation",
    "Date", "File", "Document", "Record", "Statement", "Witness",
    "Night", "Archivist", "Subject", "Incident", "Key", "Initial",
    "Final", "Section", "Chapter", "Part", "Appendix", "Exhibit",
    "Scene", "Analysis", "Observation", "Observations", "Description",
    # Location words that might appear capitalized as standalone
    "Street", "Road", "Avenue", "Building", "Park", "Station",
    "North", "South", "East", "West",
}


def _normalize_time(raw: str) -> str:
    """Convert time to HH:MM:SS format."""
    raw = raw.strip().upper()
    is_pm = "PM" in raw
    is_am = "AM" in raw
    raw = raw.replace("AM", "").replace("PM", "").strip()
    parts = raw.split(":")
    h = int(parts[0])
    m = int(parts[1]) if len(parts) > 1 else 0
    s = int(parts[2]) if len(parts) > 2 else 0
    if is_pm and h < 12:
        h += 12
    if is_am and h == 12:
        h = 0
    return f"{h:02d}:{m:02d}:{s:02d}"


def _extract_text_entities(text: str) -> tuple[list[dict], list[dict]]:
    """Extract persons and places from text using heuristics."""
    persons = []
    places = []

    # Multi-word names - search per line to avoid cross-line matches
    for line_no, line in enumerate(text.split("\n"), 1):
        for match in NAME_PATTERN.finditer(line):
            name = match.group(1)
            words = name.split()
            # Skip if ALL words are common
            if all(w in COMMON_WORDS for w in words):
                continue
            # Skip if it looks like a document title (3+ common words)
            common_count = sum(1 for w in words if w in COMMON_WORDS)
            if common_count >= len(words) - 1 and len(words) >= 3:
                continue
            # If name contains a location keyword, it might be a place
            # But "Officer James Park" or "John Street" are people with surnames
            # matching location keywords. If only the LAST word matches and there
            # are 2+ words, treat as person (likely a surname).
            loc_words = [w for w in words if w.lower() in LOCATION_KEYWORDS]
            if loc_words:
                # Only the last word is a location keyword → probably a surname
                if len(loc_words) == 1 and words[-1].lower() in LOCATION_KEYWORDS and len(words) >= 2:
                    persons.append({"name": name, "line": line_no})
                else:
                    places.append({"name": name, "line": line_no})
            else:
                persons.append({"name": name, "line": line_no})

    # Single capitalized words that appear multiple times (likely names)
    singles = SINGLE_NAME_PATTERN.findall(text)
    singles = [s for s in singles if s not in COMMON_WORDS]
    counts = Counter(singles)
    for name, count in counts.items():
        if count >= 2 and name not in [p["name"] for p in persons]:
            # Check if it's not already part of a multi-word name
            if not any(name in p["name"] for p in persons):
                persons.append({"name": name, "line": 1})

    # Locations: look for "the/a/an WORD+ LOCATION_KEYWORD" patterns
    loc_pattern = re.compile(
        r"\b(?:the|a|an|on|at|in|near|from|to)\s+"
        r"((?:[A-Z]\w*\s+)?(?:\w+\s+){0,2}"
        r"(?:" + "|".join(LOCATION_KEYWORDS) + r"))\b",
        re.IGNORECASE,
    )
    for i, line in enumerate(text.split("\n"), 1):
        for match in loc_pattern.finditer(line):
            place_name = match.group(1).strip()
            if place_name and len(place_name) > 3:
                places.append({"name": place_name, "line": i})

    # Deduplicate
    seen_persons = set()
    unique_persons = []
    for p in persons:
        if p["name"] not in seen_persons:
            seen_persons.add(p["name"])
            unique_persons.append(p)

    seen_places = set()
    unique_places = []
    for p in places:
        if p["name"].lower() not in seen_places:
            seen_places.add(p["name"].lower())
            unique_places.append(p)

    return unique_persons[:10], unique_places[:10]


def _extract_text_events(text: str) -> list[dict]:
    """Extract time-tagged events from text lines."""
    events = []
    lines = text.split("\n")
    for i, line in enumerate(lines, 1):
        times = TIME_PATTERN.findall(line)
        if times and len(line.strip()) > 10:
            t = _normalize_time(times[0])
            desc = line.strip()
            # Remove ALL time occurrences from the description
            desc = TIME_PATTERN.sub("", desc)
            # Clean up leftover artifacts
            desc = re.sub(r"(?i)\bat\s*[,.:;]\s*", "", desc)  # "At ," → ""
            desc = re.sub(r"(?i)\bat\s*$", "", desc)           # trailing "at"
            desc = re.sub(r"(?i)^at\s+", "", desc)             # leading "at "
            desc = re.sub(r"(?i)\bvia\s*$", "", desc)          # trailing "via"
            desc = re.sub(r"(?i)\bat\s+via\b", "via", desc)   # "at via" → "via"
            desc = re.sub(r"(?i)\bat\s+approximately\s*$", "", desc)
            desc = re.sub(r"\s{2,}", " ", desc)
            desc = desc.strip(" -:,.\"""'")
            if desc and len(desc) > 5:
                # Capitalize first letter
                desc = desc[0].upper() + desc[1:] if desc else desc
                events.append({
                    "time": t,
                    "description": desc[:200],
                    "line": i,
                    "source": "text",
                })
    return events


def _find_contradictions(
    video_events: list[dict], text_events: list[dict]
) -> list[Contradiction]:
    """Find contradictions between video and text evidence."""
    contradictions = []

    # Check for overlapping time ranges with different descriptions
    for ve in video_events:
        for te in text_events:
            v_start = ve.get("t_start", "")
            t_time = te.get("time", "")
            if v_start and t_time and v_start[:5] == t_time[:5]:
                # Same time period - check for conflicting descriptions
                v_desc = ve.get("description", "").lower()
                t_desc = te.get("description", "").lower()
                # Simple word overlap check - low overlap = potential contradiction
                v_words = set(v_desc.split())
                t_words = set(t_desc.split())
                overlap = len(v_words & t_words)
                total = max(len(v_words | t_words), 1)
                if overlap / total < 0.2 and len(v_desc) > 10 and len(t_desc) > 10:
                    contradictions.append(Contradiction(
                        description=f"At {v_start}: video shows '{ve['description'][:80]}' but text states '{te['description'][:80]}'",
                        evidence_refs=[
                            f"video:{ve.get('t_start', '')}-{ve.get('t_end', '')}",
                            f"text:L{te.get('line', '?')}",
                        ],
                    ))

    # If no specific contradictions found but both sources exist
    if not contradictions and video_events and text_events:
        contradictions.append(Contradiction(
            description="Video and text evidence cover different aspects of the incident; cross-referencing recommended",
            evidence_refs=["video:full", "text:full"],
        ))

    return contradictions[:5]


_NOIR_OPENERS = [
    "The rain hadn't stopped all night. Neither had the questions.",
    "Another case file on my desk. Another puzzle with too many missing pieces.",
    "The city doesn't sleep, and tonight, neither do I.",
]

_NOIR_CLOSERS = [
    "The truth is out there, buried somewhere between the footage and the files. This case stays open. Night Archivist, signing off.",
    "Somebody knows more than they're saying. They always do. Until next time. Night Archivist out.",
    "Every case has a crack. This one's no different. We just haven't found it yet. Night Archivist, signing off.",
]


def _generate_narration(
    summary: str,
    events: list[Event],
    entities: list[Entity],
    contradictions: list[Contradiction],
) -> str:
    """Generate noir-style narration from structured data. No new facts added."""
    import hashlib
    # Deterministic but varied opener/closer based on content
    h = int(hashlib.md5(summary.encode()).hexdigest(), 16)

    lines = []
    lines.append(_NOIR_OPENERS[h % len(_NOIR_OPENERS)])
    lines.append(f"Here's what the evidence tells us: {summary}")

    if entities:
        person_names = [e.name for e in entities if e.type == "person"]
        place_names = [e.name for e in entities if e.type == "place"]
        if person_names:
            names = ", ".join(person_names[:4])
            lines.append(f"The names that keep coming up: {names}.")
        if place_names:
            places = ", ".join(place_names[:3])
            lines.append(f"The scene of it all: {places}.")

    if events:
        lines.append("Let me walk you through what happened.")
        for ev in events[:5]:
            lines.append(f"At {ev.t_start}: {ev.description}.")

    if contradictions:
        lines.append("Now here's where it gets interesting.")
        for c in contradictions[:2]:
            lines.append(f"{c.description}.")
        lines.append("Something doesn't add up.")

    lines.append(_NOIR_CLOSERS[h % len(_NOIR_CLOSERS)])

    return " ".join(lines)


def fuse_evidence(video_events: list[dict], text_content: str) -> CaseResultWithNarration:
    """
    Rule-based evidence fusion. No LLM required.
    - Extracts entities and events from text using regex/heuristics
    - Merges with video events
    - Builds timeline, finds contradictions
    - Generates noir narration from templates
    """
    # --- Extract from text ---
    persons, places = _extract_text_entities(text_content)
    text_events = _extract_text_events(text_content)

    # --- Build entities ---
    entity_list: list[Entity] = []
    eid = 1
    for p in persons[:5]:
        entity_list.append(Entity(
            id=f"E{eid}", type="person", name=p["name"],
            evidence_refs=[f"text:L{p['line']}"],
        ))
        eid += 1
    for p in places[:3]:
        entity_list.append(Entity(
            id=f"E{eid}", type="place", name=p["name"],
            evidence_refs=[f"text:L{p['line']}"],
        ))
        eid += 1

    if not entity_list:
        entity_list.append(Entity(
            id="E1", type="person", name="Unknown Subject",
            evidence_refs=["text:L1"],
        ))

    # --- Build events (merge video + text) ---
    all_events: list[Event] = []
    evid = 1

    for ve in video_events:
        all_events.append(Event(
            id=f"EV{evid}",
            t_start=ve.get("t_start", "00:00:00"),
            t_end=ve.get("t_end", "00:00:00"),
            description=ve.get("description", "Activity observed"),
            entities=[],
            evidence_refs=[f"video:{ve.get('t_start', '')}-{ve.get('t_end', '')}"],
            confidence=0.7,
        ))
        evid += 1

    for te in text_events:
        all_events.append(Event(
            id=f"EV{evid}",
            t_start=te["time"],
            t_end=te["time"],
            description=te["description"],
            entities=[],
            evidence_refs=[f"text:L{te['line']}"],
            confidence=0.6,
        ))
        evid += 1

    # Sort by t_start
    all_events.sort(key=lambda e: e.t_start)

    # --- Timeline ---
    timeline = [
        TimelineEntry(time=ev.t_start, event_id=ev.id) for ev in all_events
    ]

    # --- Contradictions ---
    contradictions = _find_contradictions(video_events, text_events)

    # --- Open questions ---
    open_questions = []
    if not text_events:
        open_questions.append(OpenQuestion(
            question="Text evidence contains no timestamps. When did the events in the text occur?",
            what_evidence_needed="Timestamped witness statements or logs",
        ))
    if len(entity_list) <= 1:
        open_questions.append(OpenQuestion(
            question="Limited entities identified. Who else was involved?",
            what_evidence_needed="Additional witness testimony or surveillance footage",
        ))
    if not open_questions:
        open_questions.append(OpenQuestion(
            question="What is the connection between the video and text evidence?",
            what_evidence_needed="Cross-referenced witness statements",
        ))

    # --- Summary ---
    n_video = len(video_events)
    n_text = len(text_events)
    n_entities = len(entity_list)
    summary_text = (
        f"Analysis of {n_video} video event(s) and {n_text} text event(s) "
        f"identified {n_entities} entities. "
        f"{len(contradictions)} potential contradiction(s) detected."
    )
    confidence = min(0.9, 0.3 + 0.1 * n_video + 0.1 * n_text + 0.05 * n_entities)

    # --- Narration ---
    narration = _generate_narration(summary_text, all_events, entity_list, contradictions)

    return CaseResultWithNarration(
        case_summary=CaseSummary(one_liner=summary_text, confidence=round(confidence, 2)),
        entities=entity_list,
        events=all_events,
        timeline=timeline,
        contradictions=contradictions,
        open_questions=open_questions,
        narration_script=narration,
    )
