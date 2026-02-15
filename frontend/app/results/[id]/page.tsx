"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface CaseResult {
  case_summary: { one_liner: string; confidence: number };
  entities: { id: string; type: string; name: string; evidence_refs: string[] }[];
  events: {
    id: string;
    t_start: string;
    t_end: string;
    description: string;
    entities: string[];
    evidence_refs: string[];
    confidence: number;
  }[];
  timeline: { time: string; event_id: string }[];
  contradictions: { description: string; evidence_refs: string[] }[];
  open_questions: { question: string; what_evidence_needed: string }[];
  narration_url: string;
}

export default function ResultsPage() {
  const params = useParams();
  const caseId = params.id as string;
  const [result, setResult] = useState<CaseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    async function fetchResult() {
      try {
        const res = await fetch(`${API_URL}/cases/${caseId}/result`);
        if (!res.ok) {
          if (res.status === 400) {
            setError("Case not yet completed. Check processing status.");
            return;
          }
          throw new Error("Failed to load result");
        }
        const data = await res.json();
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load result");
      }
    }
    fetchResult();
  }, [caseId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <p className="text-noir-danger">{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <p className="text-noir-muted">Loading...</p>
      </div>
    );
  }

  const eventById = Object.fromEntries(
    result.events.map((e) => [e.id, e])
  );

  return (
    <div className="min-h-screen p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-serif text-noir-accent mb-2">
        Case summary
      </h1>
      <p className="text-noir-muted text-sm mb-8">
        Confidence: {(result.case_summary.confidence * 100).toFixed(0)}%
      </p>

      <section className="mb-10">
        <p className="text-noir-text text-lg leading-relaxed">
          {result.case_summary.one_liner}
        </p>
      </section>

      <section className="mb-10">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-xl font-serif text-noir-accent">Narration</h2>
          <audio
            ref={audioRef}
            src={result.narration_url}
            controls
            className="flex-1 h-10"
          />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-serif text-noir-accent mb-4">Timeline</h2>
        <ul className="space-y-3">
          {result.timeline.map((entry) => {
            const ev = eventById[entry.event_id];
            return (
              <li
                key={entry.time + entry.event_id}
                className="bg-noir-card border border-noir-border rounded p-4"
              >
                <span className="text-noir-accent font-mono text-sm">
                  {entry.time}
                </span>
                <p className="text-noir-text mt-1">
                  {ev?.description ?? entry.event_id}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      {result.contradictions.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-serif text-noir-accent mb-4">
            Contradictions
          </h2>
          <ul className="space-y-3">
            {result.contradictions.map((c, i) => (
              <li
                key={i}
                className="bg-noir-card border border-noir-danger/50 rounded p-4"
              >
                <p className="text-noir-text">{c.description}</p>
                {c.evidence_refs.length > 0 && (
                  <p className="text-noir-muted text-xs mt-2">
                    Evidence: {c.evidence_refs.join(", ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {result.open_questions.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-serif text-noir-accent mb-4">
            Open questions
          </h2>
          <ul className="space-y-3">
            {result.open_questions.map((q, i) => (
              <li
                key={i}
                className="bg-noir-card border border-noir-border rounded p-4"
              >
                <p className="text-noir-text">{q.question}</p>
                <p className="text-noir-muted text-sm mt-1">
                  Evidence needed: {q.what_evidence_needed}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <a
        href="/"
        className="inline-block mt-8 text-noir-accent hover:underline"
      >
        Start new case
      </a>
    </div>
  );
}
