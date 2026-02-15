"""Run this script to verify your Gemini API key works."""

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

api_key = (os.getenv("GEMINI_API_KEY") or "").strip()
print(f"Key loaded: {'yes' if api_key else 'no'}")
print(f"Key prefix: {api_key[:10]}...")
print()

if not api_key:
    print("ERROR: GEMINI_API_KEY not found in .env")
    exit(1)

success = False

# Try the NEW google-genai package first
try:
    from google import genai

    print("Trying google-genai (new SDK)...")
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents="Say 'hello' in one word.",
    )
    print("SUCCESS! Gemini responded:", response.text or "(empty)")
    success = True
except ImportError:
    print("  google-genai not installed, trying fallback...")
except Exception as e:
    print("  FAILED:", type(e).__name__, str(e)[:200])

# Fallback: google-generativeai
if not success:
    try:
        import google.generativeai as genai

        print("Trying google-generativeai...")
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content("Say 'hello' in one word.")
        print("SUCCESS! Gemini responded:", response.text)
        success = True
    except Exception as e2:
        print("  FAILED:", type(e2).__name__, str(e2)[:200])

if not success:
    print()
    print("=" * 60)
    print("The API key is being REJECTED by Google.")
    print("Create a NEW key at: https://aistudio.google.com/apikey")
    print("Check: API restrictions, billing enabled, Generative Language API enabled.")
    print("=" * 60)
