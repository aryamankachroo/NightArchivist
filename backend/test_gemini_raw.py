"""
Direct HTTP test - NO SDK. Bypasses all Python packages.
If this works, the issue is the SDK. If this fails, the issue is key/Google.
"""
import json
import os
from pathlib import Path

# Load .env manually
env_path = Path(__file__).resolve().parent / ".env"
api_key = ""
if env_path.exists():
    for line in env_path.read_text(encoding="utf-8").splitlines():
        if line.strip().startswith("GEMINI_API_KEY="):
            api_key = line.split("=", 1)[1].strip().strip('"\'')
            break

if not api_key:
    api_key = (os.getenv("GEMINI_API_KEY") or "").strip()

print(f"Key: {'loaded' if api_key else 'MISSING'}")
print(f"Prefix: {api_key[:12]}..." if api_key else "N/A")
print()

if not api_key:
    print("ERROR: No GEMINI_API_KEY")
    exit(1)

# Raw HTTP request to Gemini API - no SDK
try:
    import urllib.request

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
    body = json.dumps({
        "contents": [{"parts": [{"text": "Say hello in one word."}]}],
        "generationConfig": {"temperature": 0.2, "maxOutputTokens": 50},
    }).encode("utf-8")

    req = urllib.request.Request(url, data=body, method="POST")
    req.add_header("Content-Type", "application/json")

    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode())
        text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        print("SUCCESS! Raw HTTP worked.")
        print(f"Response: {text}")
except urllib.error.HTTPError as e:
    body = e.read().decode() if e.fp else ""
    print(f"FAILED: HTTP {e.code}")
    print(body[:500])
except Exception as e:
    print(f"FAILED: {type(e).__name__}: {e}")
