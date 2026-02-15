"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
  const router = useRouter();
  const caseId = params.id as string;
  const [result, setResult] = useState<CaseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [showEvidenceModal, setShowEvidenceModal] = useState<'video' | 'text' | null>(null);
  const [narrativeText, setNarrativeText] = useState<string>("");
  const [copiedNarrative, setCopiedNarrative] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggleEvent = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  const copyNarrative = () => {
    navigator.clipboard.writeText(narrativeText);
    setCopiedNarrative(true);
    setTimeout(() => setCopiedNarrative(false), 2000);
  };

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
        
        // Extract narrative text (first 3-5 sentences of narration_script)
        if (data.narration_script) {
          const sentences = data.narration_script.split('. ').slice(0, 5).join('. ') + '.';
          setNarrativeText(sentences);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load result");
      }
    }
    fetchResult();
  }, [caseId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleLoadedMetadata = () => {
        setAudioDuration(audio.duration);
      };
      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      return () => audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    }
  }, [result]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-b from-black via-zinc-950 to-black">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-b from-black via-zinc-950 to-black">
        <p className="text-zinc-400">Loading case file...</p>
      </div>
    );
  }

  const eventById = Object.fromEntries(result.events.map((e) => [e.id, e]));
  const confidencePercent = (result.case_summary.confidence * 100).toFixed(0);
  const confidenceColor =
    result.case_summary.confidence >= 0.7
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : result.case_summary.confidence >= 0.4
      ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
      : "bg-red-500/20 text-red-400 border-red-500/30";

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getPriority = (confidence: number) => {
    if (confidence < 0.5) return { label: "High", color: "bg-red-500/20 text-red-400 border-red-500/40" };
    if (confidence < 0.7) return { label: "Med", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40" };
    return { label: "Low", color: "bg-zinc-500/20 text-zinc-400 border-zinc-500/40" };
  };

  const pluralize = (count: number, singular: string, plural?: string) => {
    return count === 1 ? singular : (plural || `${singular}s`);
  };

  const priority = getPriority(result.case_summary.confidence);

  // Key findings extraction
  const videoEventCount = result.events.filter(e => e.evidence_refs.some(r => r.startsWith("video"))).length;
  const textEventCount = result.events.filter(e => e.evidence_refs.some(r => r.startsWith("text"))).length;
  const hasMotion = result.events.some(e => 
    e.description.toLowerCase().includes("motion") || 
    e.description.toLowerCase().includes("movement") ||
    e.description.toLowerCase().includes("enters") ||
    e.description.toLowerCase().includes("exits")
  );

  const keyFindings = [];
  if (videoEventCount === 1 && !hasMotion) {
    keyFindings.push("Scene appears static; minimal activity detected");
  }
  if (textEventCount === 0) {
    keyFindings.push("No text evidence detected");
  }
  if (result.entities.length <= 1) {
    keyFindings.push(`Only ${result.entities.length} ${pluralize(result.entities.length, 'entity', 'entities')} identified`);
  }
  if (result.contradictions.length > 0) {
    keyFindings.push(`${result.contradictions.length} contradiction${result.contradictions.length > 1 ? 's' : ''} detected between sources`);
  }
  if (keyFindings.length === 0) {
    keyFindings.push("Evidence appears consistent across all sources");
  }

  // Tags
  const tags = [];
  if (videoEventCount > 0) tags.push("CCTV");
  if (textEventCount > 0) tags.push("Text Log");
  if (!hasMotion && videoEventCount === 1) tags.push("Static Scene");
  else if (!hasMotion) tags.push("Low Motion");
  if (result.entities.length > 3) tags.push("Multi-Entity");

  const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black bg-grid-pattern">
      {/* Header */}
      <div className="border-b border-white/10 glass-panel sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-3xl font-serif text-cyan-400">Night Archivist</h1>
            <button
              onClick={() => router.push("/")}
              className="px-5 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 font-medium transition-all"
            >
              Start New Case
            </button>
          </div>
          
          {/* Case File Identity Strip */}
          <div className="flex items-center gap-4 flex-wrap text-xs font-mono">
            <div>
              <span className="text-zinc-500">CASE FILE:</span>
              <span className="ml-2 text-cyan-400 font-semibold">#{caseId.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="h-3 w-px bg-white/10" />
            <div>
              <span className="text-zinc-500">STATUS:</span>
              <span className="ml-2 text-green-400 font-semibold">Complete</span>
            </div>
            <div className="h-3 w-px bg-white/10" />
            <div>
              <span className="text-zinc-500">MODE:</span>
              <span className="ml-2 text-cyan-400 font-semibold">Deterministic</span>
            </div>
            <div className="h-3 w-px bg-white/10" />
            <div>
              <span className="text-zinc-500">LAST UPDATED:</span>
              <span className="ml-2 text-white">{now}</span>
            </div>
            {tags.length > 0 && (
              <>
                <div className="h-3 w-px bg-white/10" />
                <div className="flex gap-1.5">
                  {tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-zinc-800/50 border border-zinc-700 rounded text-zinc-400">
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Detective Desk - Two-panel Dashboard */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT PANEL - STICKY */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24 h-fit">
            {/* TOP 2×2 GRID */}
            <div className="grid grid-cols-2 gap-4">
              {/* Confidence Dial */}
              <div className="col-span-2 sm:col-span-1 glass-panel glass-panel-glow rounded-2xl p-5 transition-all">
                <h2 className="text-base font-serif text-cyan-400 mb-3">Confidence</h2>
                <div className="flex items-center justify-center py-2">
                  <div className="relative w-28 h-28">
                    <svg className="w-28 h-28 transform -rotate-90">
                      <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="7" fill="none" className="text-zinc-800" />
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        stroke="currentColor"
                        strokeWidth="7"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 48}`}
                        strokeDashoffset={`${2 * Math.PI * 48 * (1 - result.case_summary.confidence)}`}
                        className={`${
                          result.case_summary.confidence >= 0.7 ? 'text-green-500' :
                          result.case_summary.confidence >= 0.4 ? 'text-cyan-500' : 'text-red-500'
                        } transition-all duration-1000`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">{confidencePercent}%</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-center text-zinc-400 mt-2">
                  {result.case_summary.confidence >= 0.7 ? "Strong" :
                   result.case_summary.confidence >= 0.4 ? "Moderate" : "Limited"}
                </p>
              </div>

              {/* Evidence Coverage + Key Findings Combined */}
              <div className="col-span-2 sm:col-span-1 glass-panel glass-panel-glow rounded-2xl p-5 transition-all">
                <h2 className="text-base font-serif text-cyan-400 mb-3">Evidence</h2>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Video</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-300">{videoEventCount}</span>
                      {videoEventCount > 0 ? (
                        <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Text</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-300">{textEventCount}</span>
                      {textEventCount > 0 ? (
                        <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Entities</span>
                    <span className="text-zinc-300">{result.entities.length}</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-white/10">
                    <p className="text-zinc-500 text-[10px] uppercase tracking-wide mb-1.5">Key Findings</p>
                    {keyFindings.slice(0, 2).map((finding, i) => (
                      <p key={i} className="text-zinc-300 leading-tight mb-1">• {finding}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Case Narrative - Text Summary */}
            <div className="glass-panel glass-panel-glow rounded-2xl p-5 transition-all">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-serif text-cyan-400">Case Narrative</h2>
                <button
                  onClick={copyNarrative}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded text-cyan-400 transition-all"
                >
                  {copiedNarrative ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed">
                {narrativeText || result.case_summary.one_liner}
              </p>
            </div>

            {/* Evidence Preview */}
            <div className="glass-panel glass-panel-glow rounded-2xl p-5 transition-all">
              <h2 className="text-base font-serif text-cyan-400 mb-3">Source Files</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setShowEvidenceModal('video')}
                  className="w-full flex items-center justify-between p-3 bg-zinc-900/50 hover:bg-zinc-900/70 border border-white/10 hover:border-cyan-400/30 rounded-lg transition-all text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-sm text-white font-medium">Video Evidence</p>
                      <p className="text-xs text-zinc-500">{videoEventCount} {pluralize(videoEventCount, 'event')} • View footage</p>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => setShowEvidenceModal('text')}
                  className="w-full flex items-center justify-between p-3 bg-zinc-900/50 hover:bg-zinc-900/70 border border-white/10 hover:border-cyan-400/30 rounded-lg transition-all text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <p className="text-sm text-white font-medium">Text Evidence</p>
                      <p className="text-xs text-zinc-500">{textEventCount > 0 ? `${textEventCount} ${pluralize(textEventCount, 'event')} • ` : ''}View excerpt</p>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Detective's Monologue - Special Card */}
            <div className="bg-gradient-to-br from-cyan-500/5 to-cyan-600/5 border border-cyan-500/20 rounded-2xl p-5 hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-500/10 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <h2 className="text-lg font-serif text-cyan-400">Detective's Monologue</h2>
                </div>
                <div className="flex items-center gap-2">
                  {audioDuration > 0 && (
                    <span className="text-xs text-cyan-400/70 font-mono">{formatDuration(audioDuration)}</span>
                  )}
                </div>
              </div>
              
              {/* Fake waveform bars */}
              <div className="flex items-center gap-0.5 h-8 mb-3">
                {[...Array(40)].map((_, i) => {
                  const height = Math.sin(i * 0.5) * 30 + 50;
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-cyan-500/30 rounded-sm transition-all hover:bg-cyan-500/50"
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>
              
              <audio
                ref={audioRef}
                src={result.narration_url}
                controls
                className="w-full h-10 rounded-lg"
              />
              
              <div className="flex items-center justify-between mt-3">
                <span className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-cyan-400 text-xs font-medium">
                  AI Narration
                </span>
                <a
                  href={result.narration_url}
                  download="narration.mp3"
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - SCROLLABLE */}
          <div className="lg:col-span-8 space-y-5">
            {/* Key Findings */}
            <div className="glass-panel glass-panel-glow rounded-2xl p-5 transition-all">
              <h2 className="text-xl font-serif text-cyan-400 mb-3">Key Findings</h2>
              <ul className="space-y-2">
                {keyFindings.map((finding, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-200">
                    <svg className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Investigation Log - Timeline with Spine */}
            <div className="glass-panel glass-panel-glow rounded-2xl p-6 transition-all">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-serif text-cyan-400">Investigation Log</h2>
                <span className="text-sm text-zinc-500">{result.timeline.length} {pluralize(result.timeline.length, 'entry', 'entries')}</span>
              </div>
              
              <div className="relative">
                {/* Vertical Timeline Spine */}
                <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500/50 via-cyan-500/30 to-transparent" />
                
                <div className="space-y-4">
                  {result.timeline.map((entry, idx) => {
                    const ev = eventById[entry.event_id];
                    if (!ev) return null;
                    const isExpanded = expandedEvents.has(entry.event_id);
                    
                    // Auto-generate event title from description
                    const eventTitle = ev.description.split('.')[0].slice(0, 60) + (ev.description.length > 60 ? '...' : '');
                    
                    return (
                      <div key={entry.time + entry.event_id} className="relative pl-16">
                        {/* Timeline Dot */}
                        <div className={`absolute left-5 top-2 w-4 h-4 rounded-full bg-cyan-500 border-2 border-black shadow-lg shadow-cyan-500/50 ${idx === 0 ? 'pulse-dot' : ''}`} />
                        
                        {/* Event Card */}
                        <div className="bg-zinc-900/50 border border-white/10 rounded-lg overflow-hidden hover:border-cyan-400/30 hover:bg-zinc-900/70 transition-all">
                          <button
                            onClick={() => toggleEvent(entry.event_id)}
                            className="w-full text-left p-4 flex items-start justify-between gap-4 cursor-pointer"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1">
                                <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/30 rounded text-cyan-400 font-mono text-xs font-semibold">
                                  {entry.time}
                                </span>
                                <span className="text-xs text-zinc-500">
                                  Confidence {(ev.confidence * 100).toFixed(0)}%
                                </span>
                              </div>
                              <p className="text-white font-medium text-sm">{eventTitle}</p>
                            </div>
                            <svg
                              className={`w-5 h-5 text-zinc-400 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          
                          {/* Expandable Details */}
                          {isExpanded && (
                            <div className="px-4 pb-4 pt-3 border-t border-white/5 space-y-3 animate-fadeIn">
                              <p className="text-zinc-300 text-sm leading-relaxed">{ev.description}</p>
                              
                              {/* Time Range Badge */}
                              {ev.t_start !== ev.t_end && (
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-cyan-400 text-xs font-mono">
                                    {ev.t_start} – {ev.t_end}
                                  </span>
                                  <button className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Jump to segment
                                  </button>
                                </div>
                              )}
                              
                              {ev.evidence_refs.length > 0 && (
                                <div>
                                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Evidence References</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {ev.evidence_refs.map((ref, i) => (
                                      <span
                                        key={i}
                                        className="px-2 py-1 bg-zinc-800/80 border border-zinc-700 rounded text-zinc-300 text-xs font-mono"
                                      >
                                        {ref}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Actions */}
                              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 hover:border-cyan-400/30 rounded text-zinc-400 hover:text-cyan-400 text-xs transition-all">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                  </svg>
                                  Bookmark
                                </button>
                                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 hover:border-cyan-400/30 rounded text-zinc-400 hover:text-cyan-400 text-xs transition-all">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Add note
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Entities */}
            <div className="glass-panel glass-panel-glow rounded-2xl p-5 transition-all">
              <h2 className="text-2xl font-serif text-cyan-400 mb-4">Entities</h2>
              {result.entities.length > 0 ? (
                <div className="space-y-4">
                  {["person", "place", "object"].map((type) => {
                    const filtered = result.entities.filter((e) => e.type === type);
                    if (filtered.length === 0) return null;
                    return (
                      <div key={type}>
                        <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
                          {type === "person" ? "People" : type === "place" ? "Places" : "Objects"} ({filtered.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {filtered.map((entity) => (
                            <span
                              key={entity.id}
                              className="px-3 py-1.5 bg-zinc-900/50 border border-white/10 rounded-lg text-zinc-200 text-sm hover:border-cyan-400/40 hover:bg-zinc-900/70 transition-all cursor-default"
                            >
                              {entity.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-zinc-900/30 rounded-lg">
                  <svg className="w-10 h-10 mx-auto mb-2 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-zinc-500 text-sm">No entities identified</p>
                </div>
              )}
            </div>

            {/* Contradictions */}
            <div className="glass-panel glass-panel-glow rounded-2xl p-5 border-red-500/20 transition-all">
              <h2 className="text-2xl font-serif text-cyan-400 mb-4">Contradictions</h2>
              {result.contradictions.length > 0 ? (
                <div className="space-y-3">
                  {result.contradictions.map((c, i) => (
                    <div
                      key={i}
                      className="bg-red-500/5 border border-red-500/30 rounded-lg p-4 hover:border-red-500/50 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-zinc-200 text-sm leading-relaxed mb-2">{c.description}</p>
                          {c.evidence_refs.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {c.evidence_refs.map((ref, j) => (
                                <span
                                  key={j}
                                  className="px-2 py-0.5 bg-red-900/20 border border-red-700/30 rounded text-red-400 text-xs font-mono"
                                >
                                  {ref}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-green-500/5 border border-green-500/30 rounded-lg">
                  <svg className="w-10 h-10 mx-auto mb-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-green-400 text-sm font-medium">No contradictions detected</p>
                  <p className="text-green-500/60 text-xs mt-1">Evidence sources align</p>
                </div>
              )}
            </div>

            {/* Leads to Follow */}
            <div className="glass-panel glass-panel-glow rounded-2xl p-5 transition-all">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-serif text-cyan-400">Leads to Follow</h2>
                <span className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-cyan-400 text-xs font-semibold">
                  {result.open_questions.length} {pluralize(result.open_questions.length, 'lead')}
                </span>
              </div>
              {result.open_questions.length > 0 ? (
                <div className="space-y-3">
                  {result.open_questions.map((q, i) => (
                    <div
                      key={i}
                      className="bg-zinc-900/50 border border-white/10 rounded-lg p-4 hover:border-cyan-400/30 hover:bg-zinc-900/70 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold border shrink-0 ${priority.color}`}>
                          {priority.label}
                        </span>
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm mb-2">{q.question}</p>
                          <div className="flex items-start gap-1.5">
                            <svg className="w-3.5 h-3.5 text-zinc-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-zinc-400 text-xs">
                              <span className="text-zinc-500">Evidence needed:</span> {q.what_evidence_needed}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-zinc-900/30 rounded-lg">
                  <svg className="w-10 h-10 mx-auto mb-2 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <p className="text-zinc-500 text-sm">All leads exhausted</p>
                  <p className="text-zinc-600 text-xs mt-1">Case analysis complete</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Evidence Modal */}
      {showEvidenceModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setShowEvidenceModal(null)}
        >
          <div 
            className="bg-zinc-900 border border-white/20 rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-lg font-serif text-cyan-400">
                {showEvidenceModal === 'video' ? 'Video Evidence' : 'Text Evidence'}
              </h3>
              <button
                onClick={() => setShowEvidenceModal(null)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
              >
                <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              {showEvidenceModal === 'video' ? (
                <div className="text-center">
                  <div className="bg-zinc-800/50 border border-white/10 rounded-lg p-8">
                    <svg className="w-16 h-16 mx-auto mb-4 text-cyan-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-zinc-400 text-sm mb-2">Video footage analyzed</p>
                    <p className="text-zinc-500 text-xs">{videoEventCount} {pluralize(videoEventCount, 'event')} extracted from source</p>
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-800/50 border border-white/10 rounded-lg p-5">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Text Evidence Excerpt</p>
                  <div className="space-y-2 text-sm text-zinc-300 font-mono">
                    {textEventCount > 0 ? (
                      result.events
                        .filter(e => e.evidence_refs.some(r => r.startsWith("text")))
                        .slice(0, 5)
                        .map((event, i) => (
                          <div key={i} className="p-3 bg-zinc-900/50 rounded border border-white/5">
                            <p className="text-cyan-400 text-xs mb-1">{event.t_start}</p>
                            <p className="text-zinc-200">{event.description}</p>
                          </div>
                        ))
                    ) : (
                      <p className="text-zinc-500 italic text-center py-6">No timestamped text evidence detected in upload</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subtle scan line effect */}
      <div className="fixed inset-0 pointer-events-none z-10 scanline" />
    </div>
  );
}
