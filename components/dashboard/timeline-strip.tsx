"use client"

import { useState, useRef } from "react"
import { cn } from "@/lib/utils"

const EVENTS = [
  {
    id: 1,
    time: "21:14",
    date: "Feb 11",
    title: "Subject enters east gate",
    severity: "normal" as const,
    source: "CCTV Feed #3",
    detail: "Whitmore identified entering via east perimeter gate. Carrying dark briefcase.",
  },
  {
    id: 2,
    time: "21:32",
    date: "Feb 11",
    title: "Unauthorized server access",
    severity: "critical" as const,
    source: "Access Logs",
    detail: "Keycard used on server room B-4. Authorization level mismatch flagged.",
  },
  {
    id: 3,
    time: "21:47",
    date: "Feb 11",
    title: "Contact with Agent Lee",
    severity: "important" as const,
    source: "Audio Intercept",
    detail: "Brief exchange recorded near south corridor. Partial transcript recovered.",
  },
  {
    id: 4,
    time: "22:03",
    date: "Feb 11",
    title: "Harbor district explosion",
    severity: "critical" as const,
    source: "Emergency Dispatch",
    detail: "Explosion reported at warehouse 7. Fire suppression activated. 2 injuries.",
  },
  {
    id: 5,
    time: "22:18",
    date: "Feb 11",
    title: "Subject exits south stairwell",
    severity: "normal" as const,
    source: "CCTV Feed #7",
    detail: "Whitmore seen departing via south stairwell. Briefcase no longer visible.",
  },
]

const SEV = {
  normal:    { dot: "bg-white/20", border: "border-white/[0.04]", badge: "text-white/40" },
  important: { dot: "bg-[#00F0FF]", border: "border-[#00F0FF]/20", badge: "text-[#00F0FF]" },
  critical:  { dot: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]", border: "border-red-500/20", badge: "text-red-400" },
}

export function TimelineStrip() {
  const [activeId, setActiveId] = useState(2)
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <div className="rounded-xl glass noise-overlay overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.03]">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-[#00F0FF] shadow-[0_0_6px_rgba(0,240,255,0.4)]" />
          <span className="text-[9px] font-mono tracking-[0.25em] uppercase text-white/40">Event Timeline</span>
          <span className="text-[9px] font-mono text-white/20">{EVENTS.length} events</span>
        </div>
        {/* Scrub indicator line */}
        <div className="hidden md:flex items-center gap-1.5">
          <span className="text-[9px] font-mono text-white/20">21:00</span>
          <div className="w-32 h-0.5 rounded-full bg-white/[0.04] relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#00F0FF]/40 to-[#00F0FF] rounded-full transition-all duration-500"
              style={{ width: `${((activeId) / EVENTS.length) * 100}%` }}
            />
          </div>
          <span className="text-[9px] font-mono text-white/20">23:00</span>
        </div>
      </div>

      {/* Scrollable cards */}
      <div ref={scrollRef} className="flex gap-3 p-3 overflow-x-auto">
        {EVENTS.map((ev) => {
          const s = SEV[ev.severity]
          const isActive = activeId === ev.id
          return (
            <button
              key={ev.id}
              onClick={() => setActiveId(ev.id)}
              className={cn(
                "relative shrink-0 w-52 text-left rounded-lg p-3 border transition-all duration-300 group",
                isActive
                  ? "bg-white/[0.04] border-[#00F0FF]/20 shadow-[0_0_20px_-6px_rgba(0,240,255,0.12)]"
                  : "bg-white/[0.015] border-white/[0.03] hover:bg-white/[0.03] hover:border-white/[0.06]",
                isActive && "translate-y-[-2px]"
              )}
            >
              {/* Top edge neon glow for active */}
              {isActive && (
                <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-[#00F0FF]/40 to-transparent" />
              )}

              <div className="flex items-center gap-2 mb-2">
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", s.dot)} />
                <span className="text-[10px] font-mono text-white/30">{ev.date}</span>
                <span className={cn("text-[10px] font-mono font-semibold", isActive ? "text-[#00F0FF]" : "text-white/50")}>{ev.time}</span>
                {ev.severity === "critical" && (
                  <span className="ml-auto text-[8px] font-mono tracking-wider uppercase text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">CRIT</span>
                )}
              </div>

              <p className={cn(
                "text-xs font-medium leading-snug mb-1.5 transition-colors",
                isActive ? "text-foreground" : "text-white/60 group-hover:text-white/80"
              )}>
                {ev.title}
              </p>

              <p className="text-[10px] text-white/25 font-mono leading-relaxed line-clamp-2">
                {ev.detail}
              </p>

              <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/[0.03]">
                <div className="w-1 h-1 rounded-full bg-white/10" />
                <span className="text-[9px] font-mono text-white/20">{ev.source}</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Bottom timeline dots */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-0">
          <div className="flex-1 h-px bg-white/[0.04] relative">
            {EVENTS.map((ev, i) => {
              const left = ((i + 0.5) / EVENTS.length) * 100
              const isActive = activeId === ev.id
              return (
                <button
                  key={ev.id}
                  onClick={() => setActiveId(ev.id)}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
                  style={{ left: `${left}%` }}
                  aria-label={`Jump to ${ev.title}`}
                >
                  <span className={cn(
                    "block rounded-full transition-all duration-300",
                    isActive ? "w-2.5 h-2.5 bg-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.5)]" : "w-1.5 h-1.5 bg-white/15 hover:bg-white/30"
                  )} />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
