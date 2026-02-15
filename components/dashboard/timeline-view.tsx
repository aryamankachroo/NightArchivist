"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileVideo, FileText, Mic, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

type TimelineEvent = {
  id: string
  timestamp: string
  title: string
  description: string
  source: "video" | "text" | "audio"
  sourceFile: string
  entities: string[]
  severity: "normal" | "important" | "critical"
}

const events: TimelineEvent[] = [
  {
    id: "evt-001",
    timestamp: "2026-02-10 21:14:00",
    title: "Subject A enters the facility",
    description:
      "Surveillance camera 03 captures an unidentified male entering through the east entrance. No badge scan detected. Subject appears to be carrying a dark briefcase.",
    source: "video",
    sourceFile: "surveillance_cam_03.mp4",
    entities: ["Subject A", "East Entrance", "Briefcase"],
    severity: "important",
  },
  {
    id: "evt-002",
    timestamp: "2026-02-10 21:18:30",
    title: "Badge anomaly logged",
    description:
      "System log records an invalid badge attempt at server room door. Badge ID does not match any registered employee. Three consecutive failed attempts before timeout.",
    source: "text",
    sourceFile: "witness_statement.txt",
    entities: ["Server Room", "Badge System"],
    severity: "critical",
  },
  {
    id: "evt-003",
    timestamp: "2026-02-10 21:22:15",
    title: "Conversation detected in hallway",
    description:
      "Audio intercept captures a brief exchange between two voices. Mention of 'the package' and 'third floor'. Second voice identified as possibly female.",
    source: "audio",
    sourceFile: "radio_intercept.wav",
    entities: ["Subject A", "Subject B", "Third Floor"],
    severity: "important",
  },
  {
    id: "evt-004",
    timestamp: "2026-02-10 21:31:00",
    title: "Power fluctuation recorded",
    description:
      "Building management system logs a 4-second power interruption on the third floor. Emergency lighting activates briefly. Cameras offline during this window.",
    source: "text",
    sourceFile: "witness_statement.txt",
    entities: ["Third Floor", "Power Grid"],
    severity: "critical",
  },
  {
    id: "evt-005",
    timestamp: "2026-02-10 21:45:00",
    title: "Subject A exits via south stairwell",
    description:
      "Camera captures Subject A leaving through the south stairwell. Briefcase no longer visible. Subject appears to be moving quickly. Exit door alarm does not trigger.",
    source: "video",
    sourceFile: "surveillance_cam_03.mp4",
    entities: ["Subject A", "South Stairwell"],
    severity: "normal",
  },
]

const sourceIcons = { video: FileVideo, text: FileText, audio: Mic }

const severityConfig = {
  normal: {
    badge: "bg-secondary/60 text-muted-foreground border-border/30",
    node: "glass-inset",
    glow: "",
    cardClass: "glass-panel glass-panel-hover",
  },
  important: {
    badge: "bg-primary/10 text-primary border-primary/20",
    node: "bg-primary/[0.08] border-primary/25",
    glow: "shadow-[0_0_18px_-3px_hsla(170,100%,45%,0.3)]",
    cardClass: "glass-panel glass-panel-hover",
  },
  critical: {
    badge: "bg-red-500/10 text-red-400 border-red-500/20",
    node: "bg-red-500/[0.08] border-red-500/25",
    glow: "shadow-[0_0_18px_-3px_hsla(0,72%,51%,0.3)]",
    cardClass: "glass-neon",
  },
}

export function TimelineView() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="relative max-w-3xl">
      {/* Glowing vertical line */}
      <div className="absolute left-[22px] top-0 bottom-0 w-px">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-primary/10 to-border" />
        <div className="absolute top-0 left-0 w-px h-16 bg-primary/40" style={{ boxShadow: "0 0 8px hsla(170, 100%, 45%, 0.3)" }} />
      </div>

      <div className="flex flex-col gap-8">
        {events.map((event) => {
          const Icon = sourceIcons[event.source]
          const isExpanded = expandedId === event.id
          const config = severityConfig[event.severity]

          return (
            <div key={event.id} className="relative flex gap-6 group">
              {/* Timeline node */}
              <div className="relative z-10 flex-shrink-0">
                <div
                  className={cn(
                    "flex items-center justify-center w-11 h-11 rounded-full border transition-all duration-500",
                    config.node,
                    config.glow,
                    "group-hover:scale-110"
                  )}
                >
                  {event.severity === "critical" ? (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  ) : (
                    <Icon className="w-4 h-4 text-primary" />
                  )}
                </div>
              </div>

              {/* Event card — glass panel */}
              <div className={cn("flex-1 rounded-xl overflow-hidden transition-all duration-300 relative", config.cardClass)}>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-[10px] font-mono tracking-[0.2em] text-primary/60">
                        {event.timestamp}
                      </p>
                      <h3 className="mt-1.5 text-sm font-sans font-semibold text-foreground">
                        {event.title}
                      </h3>
                    </div>
                    <Badge variant="outline" className={cn("text-[10px]", config.badge)}>
                      {event.severity}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{event.sourceFile}</span>
                  </div>

                  <p
                    className={cn(
                      "text-sm leading-relaxed text-muted-foreground transition-all",
                      !isExpanded && "line-clamp-2"
                    )}
                  >
                    {event.description}
                  </p>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex flex-wrap gap-1.5">
                      {event.entities.map((entity) => (
                        <span
                          key={entity}
                          className="px-2.5 py-1 text-[10px] font-sans rounded-full glass-inset text-primary/70 border border-primary/10"
                        >
                          {entity}
                        </span>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedId(isExpanded ? null : event.id)}
                      className="p-1.5 h-auto text-muted-foreground hover:text-primary"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
