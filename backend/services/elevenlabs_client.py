"""ElevenLabs client for noir narration audio generation."""

import os
from pathlib import Path

from elevenlabs.client import ElevenLabs

# Adam voice - good for noir/detective tone (well-known default)
NOIR_VOICE_ID = "pNInz6obpgDQGcFmaJgB"
# Alternative: "VR6AewLTigWG4xSOukaG" (Arnold) for deeper noir


def get_client() -> ElevenLabs:
    """Get ElevenLabs client."""
    api_key = os.getenv("ELEVENLABS_API_KEY")
    if not api_key:
        raise ValueError("ELEVENLABS_API_KEY environment variable is required")
    return ElevenLabs(api_key=api_key)


def text_to_speech(text: str, output_path: Path, voice_id: str = NOIR_VOICE_ID) -> Path:
    """
    Convert narration text to MP3 and save to output_path.
    Returns path to saved file.
    """
    client = get_client()

    # Limit text to ~90-120 seconds (~225-300 words, ~1500-2000 chars)
    max_chars = 2000
    if len(text) > max_chars:
        text = text[:max_chars].rsplit(".", 1)[0] + "."

    audio = client.text_to_speech.convert(
        text=text,
        voice_id=voice_id,
        model_id="eleven_multilingual_v2",
        output_format="mp3_44100_128",
    )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "wb") as f:
        if isinstance(audio, bytes):
            f.write(audio)
        else:
            for chunk in audio:
                if isinstance(chunk, bytes):
                    f.write(chunk)
                elif hasattr(chunk, "data") and chunk.data:
                    f.write(chunk.data)

    return output_path
