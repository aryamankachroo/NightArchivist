"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const STEPS = ["Uploading", "Video Analysis", "Reasoning", "Narration"];

export default function ProcessingPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;
  const [status, setStatus] = useState<{
    status: string;
    progress: number;
    current_step: string;
    error: string | null;
  } | null>(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`${API_URL}/cases/${caseId}/status`);
        if (!res.ok) return;
        const data = await res.json();
        setStatus(data);

        if (data.status === "completed") {
          router.push(`/results/${caseId}`);
          return;
        }
      } catch {
        // Ignore poll errors
      }
    };

    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [caseId, router]);

  const currentStepIndex = status?.current_step
    ? STEPS.findIndex((s) =>
        status.current_step.toLowerCase().includes(s.toLowerCase())
      )
    : 0;
  const effectiveStep = currentStepIndex >= 0 ? currentStepIndex : 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-serif text-noir-accent mb-8 text-center">
          Processing case
        </h1>

        <div className="bg-noir-card border border-noir-border rounded p-8 space-y-6">
          {status?.status === "failed" ? (
            <div>
              <p className="text-noir-danger font-medium">Processing failed</p>
              <p className="text-noir-muted text-sm mt-2">
                {status.error || "Unknown error"}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {STEPS.map((step, i) => (
                  <div
                    key={step}
                    className={`flex items-center gap-3 ${
                      i <= effectiveStep ? "text-noir-text" : "text-noir-muted"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        i < effectiveStep
                          ? "bg-noir-accent text-noir-bg"
                          : i === effectiveStep
                          ? "bg-noir-accent/50 text-noir-bg"
                          : "bg-noir-border text-noir-muted"
                      }`}
                    >
                      {i < effectiveStep ? "✓" : i + 1}
                    </span>
                    {step}
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <div className="h-2 bg-noir-border rounded overflow-hidden">
                  <div
                    className="h-full bg-noir-accent transition-all duration-500"
                    style={{ width: `${status?.progress ?? 0}%` }}
                  />
                </div>
                <p className="text-noir-muted text-xs mt-2">
                  {status?.current_step || "Initializing..."}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
