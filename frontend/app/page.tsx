"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function UploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const videoFile = videoRef.current?.files?.[0];
    const textFile = textRef.current?.files?.[0];

    if (!videoFile || !textFile) {
      setError("Please select both a video file and a text file.");
      return;
    }

    setLoading(true);
    try {
      const createRes = await fetch(`${API_URL}/cases`, { method: "POST" });
      if (!createRes.ok) throw new Error("Failed to create case");
      const { case_id } = await createRes.json();

      const formData = new FormData();
      formData.append("video", videoFile);
      formData.append("text", textFile);

      const uploadRes = await fetch(`${API_URL}/cases/${case_id}/upload`, {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        throw new Error(err.detail || "Upload failed");
      }

      const processRes = await fetch(`${API_URL}/cases/${case_id}/process`, {
        method: "POST",
      });
      if (!processRes.ok) throw new Error("Failed to start processing");

      router.push(`/processing/${case_id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      if (message === "Failed to fetch" || message.includes("fetch")) {
        setError(
          "Cannot reach the backend. Start it with: cd backend && python -m uvicorn main:app --reload --host 0.0.0.0"
        );
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative">
      {/* Top status bar - glass morphism */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 glass-panel glass-panel-glow px-5 py-2.5 rounded-lg flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-noir-accent shadow-[0_0_8px_var(--noir-accent)] animate-pulse" />
        <span className="text-noir-muted text-sm font-medium">SYSTEM ONLINE</span>
        <span className="text-noir-muted/60 text-xs">|</span>
        <span className="text-noir-muted text-xs">v2.0</span>
      </div>

      <div className="w-full max-w-md mt-8">
        <h1 className="text-3xl font-serif text-center mb-2">
          <span className="text-white">Night</span>{" "}
          <span className="text-noir-accent">Archivist</span>
        </h1>
        <p className="text-noir-muted text-center mb-10 text-sm">
          Reconstruct truth from fragmented evidence.
        </p>

        <form
          onSubmit={handleSubmit}
          className="glass-panel glass-panel-glow rounded-2xl p-8 space-y-7"
        >
          <div className="space-y-2">
            <label className="block text-sm font-medium text-noir-text">
              Video evidence
            </label>
            <input
              ref={videoRef}
              type="file"
              accept=".mp4,.mov,.avi,.mkv,.webm"
              className="block w-full text-sm text-noir-muted file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border file:border-cyan-400/40 file:bg-cyan-500/10 file:text-cyan-400 file:font-medium file:cursor-pointer hover:file:bg-cyan-500/20 hover:file:border-cyan-400/60 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-noir-text">
              Text evidence
            </label>
            <input
              ref={textRef}
              type="file"
              accept=".txt"
              className="block w-full text-sm text-noir-muted file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border file:border-cyan-400/40 file:bg-cyan-500/10 file:text-cyan-400 file:font-medium file:cursor-pointer hover:file:bg-cyan-500/20 hover:file:border-cyan-400/60 transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-5 bg-cyan-400 text-black font-semibold rounded-lg hover:bg-cyan-300 hover:shadow-[0_0_24px_rgba(34,211,238,0.35)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? "Starting..." : "Start case"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
