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
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-serif text-noir-accent mb-2 text-center">
          Night Archivist
        </h1>
        <p className="text-noir-muted text-center mb-12 text-sm">
          AI investigative assistant. Upload evidence. Reconstruct the truth.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-noir-card border border-noir-border rounded p-8 space-y-6"
        >
          <div>
            <label className="block text-sm text-noir-muted mb-2">
              Video evidence
            </label>
            <input
              ref={videoRef}
              type="file"
              accept=".mp4,.mov,.avi,.mkv,.webm"
              className="block w-full text-sm text-noir-muted file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-noir-accent file:text-noir-bg file:font-medium"
            />
          </div>

          <div>
            <label className="block text-sm text-noir-muted mb-2">
              Text evidence
            </label>
            <input
              ref={textRef}
              type="file"
              accept=".txt"
              className="block w-full text-sm text-noir-muted file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-noir-accent file:text-noir-bg file:font-medium"
            />
          </div>

          {error && (
            <p className="text-noir-danger text-sm bg-noir-danger/10 border border-noir-danger/30 rounded px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-noir-accent text-noir-bg font-medium rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Starting..." : "Start case"}
          </button>
        </form>
      </div>
    </div>
  );
}
