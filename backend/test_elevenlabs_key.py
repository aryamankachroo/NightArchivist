"""Direct test of ElevenLabs API key."""

from pathlib import Path
from dotenv import load_dotenv
import os

load_dotenv(Path(__file__).parent / ".env")

api_key = os.getenv("ELEVENLABS_API_KEY")
print(f"API Key loaded: {api_key[:20]}... (length: {len(api_key)})")

try:
    from elevenlabs import ElevenLabs
    
    print("\nAttempting to create ElevenLabs client...")
    client = ElevenLabs(api_key=api_key)
    
    print("OK - Client created successfully")
    
    print("\nAttempting to list available voices...")
    voices = client.voices.get_all()
    print(f"OK - Successfully retrieved {len(voices.voices)} voices")
    
    for v in voices.voices[:3]:
        print(f"  - {v.name} ({v.voice_id})")
    
    print("\nSUCCESS - ElevenLabs API key is VALID and working!")
    
except Exception as e:
    print(f"\nFAILED - ElevenLabs API key test FAILED:")
    print(f"Error: {e}")
    print(f"\nError type: {type(e).__name__}")
    
    if hasattr(e, 'status_code'):
        print(f"Status code: {e.status_code}")
    if hasattr(e, 'body'):
        print(f"Body: {e.body}")
    
    print("\nTroubleshooting steps:")
    print("1. Go to https://elevenlabs.io/app/settings/api-keys")
    print("2. Generate a NEW API key")
    print("3. Copy the ENTIRE key (should start with 'sk_' lowercase)")
    print("4. Replace in backend/.env")
    print("5. Restart the backend")
