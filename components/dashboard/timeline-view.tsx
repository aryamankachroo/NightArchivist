"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
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

const sourceIcons = {
  video: FileVideo,
  text: FileText,
  audio: Mic,
}

const severityStyles = {
  normal: "bg-secondary text-muted-foreground",
  important: "bg-primary/10 text-primary border-primary/20",
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
}

export function TimelineView() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="relative max-w-3xl">
      {/* Vertical line */}
      <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />

      <div className="flex flex-col gap-6">
        {events.map((event, index) => {
          const Icon = sourceIcons[event.source]
          const isExpanded = expandedId === event.id
          const isLast = index === events.length - 1

          return (
            <div key={event.id} className="relative flex gap-5">
              {/* Timeline node */}
              <div className="relative z-10 flex-shrink-0">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border",
                    event.severity === "critical"
                      ? "bg-red-500/10 border-red-500/30"
                      : event.severity === "important"
                      ? "bg-primary/10 border-primary/30"
                      : "bg-card border-border"
                  )}
                >
                  {event.severity === "critical" ? (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  ) : (
                    <Icon className="w-4 h-4 text-primary" />
                  )}
                </div>
                {!isLast && <div className="absolute left-1/2 top-10 bottom-0 -translate-x-1/2 w-px" />}
              </div>

              {/* Event card */}
              <Card className="flex-1 bg-card/50 border-border hover:border-primary/20 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-[10px] font-sans tracking-[0.15em] text-muted-foreground font-mono">
                        {event.timestamp}
                      </p>
                      <h3 className="mt-1 text-sm font-sans font-semibold text-foreground">
                        {event.title}
                      </h3>
                    </div>
                    <Badge variant="outline" className={severityStyles[event.severity]}>
                      {event.severity}
                    </Badge>
                  </div>

                  {/* Source tag */}
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{event.sourceFile}</span>
                  </div>

                  {/* Description (collapsible) */}
                  <p
                    className={cn(
                      "text-sm leading-relaxed text-muted-foreground transition-all",
                      !isExpanded && "line-clamp-2"
                    )}
                  >
                    {event.description}
                  </p>

                  {/* Entity tags + expand button */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex flex-wrap gap-1.5">
                      {event.entities.map((entity) => (
                        <span
                          key={entity}
                          className="px-2 py-0.5 text-[10px] font-sans rounded-full bg-secondary text-muted-foreground border border-border"
                        >
                          {entity}
                        </span>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedId(isExpanded ? null : event.id)}
                      className="p-1 h-auto text-muted-foreground hover:text-foreground"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}
