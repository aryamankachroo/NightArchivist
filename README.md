# Night Archivist

AI investigative assistant for the NC State Hackathon 2026. Takes mixed evidence (video + text) and reconstructs what happened using TwelveLabs, Gemini, and ElevenLabs.

**Theme:** Urban Noir — crime, mystery, surveillance, deception, fragmented truth.

## Features

- **Video analysis** — Extract key events with timestamps using TwelveLabs
- **Evidence fusion** — Combine video + text into structured JSON via Gemini
- **Noir narration** — Generate detective-style audio summary with ElevenLabs

## Project structure

```
NightArchivist/
├── backend/          # FastAPI (Python)
├── frontend/         # Next.js (TypeScript)
├── data/             # Local case storage (created at runtime)
└── README.md
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- API keys: Gemini, TwelveLabs, ElevenLabs

## Setup

### 1. API keys

Create `backend/.env` from the example:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and add your API keys:

```
GEMINI_API_KEY=your_gemini_api_key
TWELVELABS_API_KEY=your_twelvelabs_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

**Where to get keys:**

- [Gemini API](https://aistudio.google.com/apikey)
- [TwelveLabs](https://twelvelabs.io) — sign up and create an API key
- [ElevenLabs](https://elevenlabs.io) — sign up and create an API key

**TwelveLabs index (optional):** If you have an existing index ID, set `TWELVELABS_INDEX_ID` in `.env`. Otherwise the backend will create one at first use (index creation can take a minute).

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API runs at `http://localhost:8000`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

If the backend is on a different host/port, create `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Usage

1. **Upload** — Select a video file (mp4, mov, etc.) and a text file (.txt) with evidence
2. **Processing** — Wait while the pipeline runs: Video Analysis → Reasoning → Narration
3. **Results** — View case summary, timeline, contradictions, open questions, and play the noir narration

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/cases` | Create new case, returns `case_id` |
| POST | `/cases/{id}/upload` | Upload video + text (multipart) |
| POST | `/cases/{id}/process` | Start processing pipeline |
| GET | `/cases/{id}/status` | Get processing status |
| GET | `/cases/{id}/result` | Get final JSON + narration URL |
| GET | `/cases/{id}/narration` | Stream narration MP3 |

## License

MIT
