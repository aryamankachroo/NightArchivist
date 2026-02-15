"use client"

import { CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Network, Clock, FileStack, AlertTriangle, Activity } from "lucide-react"
import { EvidenceUploader } from "@/components/dashboard/evidence-uploader"
import { EntityGraph } from "@/components/dashboard/entity-graph"
import { TimelineView } from "@/components/dashboard/timeline-view"
import { cn } from "@/lib/utils"

const summaryStats = [
  { label: "Evidence files", value: "3", icon: FileStack, detail: "1 video, 1 text, 1 audio" },
  { label: "Events", value: "5", icon: Clock, detail: "Extracted" },
  { label: "Entities", value: "8", icon: Network, detail: "In graph" },
  { label: "Anomalies", value: "1", icon: AlertTriangle, detail: "Review" },
]

const activityLog = [
  { ts: "14:32:01", msg: "Evidence ingestion started", level: "info" },
  { ts: "14:32:04", msg: "surveillance_cam_03.mp4 processed", level: "info" },
  { ts: "14:32:11", msg: "Entity extraction complete", level: "info" },
  { ts: "14:32:18", msg: "Anomaly flagged: badge_attempt_3", level: "warn" },
  { ts: "14:32:22", msg: "Timeline built", level: "info" },
]

export function NightArchivistDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted-foreground text-neon">
            Night Archivist
          </p>
          <h1 className="font-sans text-2xl md:text-3xl font-semibold text-foreground tracking-tight mt-0.5">
            Investigation Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-muted-foreground">Case</span>
          <Badge variant="outline" className="font-mono text-xs border-neon/30 text-neon bg-neon/5">
            #2026-0214
          </Badge>
        </div>
      </div>

      {/* Row 1: Evidence upload + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evidence upload — glass */}
        <div className="lg:col-span-2 rounded-xl glass-panel overflow-hidden border border-white/[0.06]">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <CardTitle className="text-sm font-sans font-semibold text-foreground flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-neon" aria-hidden />
              <span>Evidence upload</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1 font-sans">
              Drop files or browse. Video, text, and audio supported.
            </p>
          </div>
          <div className="p-5">
            <EvidenceUploader />
          </div>
        </div>

        {/* Summary panel — glass + subtle neon */}
        <div className="rounded-xl glass-panel glass-panel-neon overflow-hidden border border-white/[0.06]">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <CardTitle className="text-sm font-sans font-semibold text-foreground flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-neon" aria-hidden />
              <span>Summary</span>
            </CardTitle>
          </div>
          <CardContent className="p-5 pt-4">
            <div className="grid grid-cols-2 gap-4">
              {summaryStats.map((stat) => (
                <div
                  key={stat.label}
                  className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <stat.icon className="w-3.5 h-3.5 text-neon" />
                    <span className="text-[10px] font-mono uppercase tracking-wider">
                      {stat.label}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xl font-sans font-semibold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-sans mt-0.5">
                    {stat.detail}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-neon" />
                  Pipeline
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">62%</span>
              </div>
              <Progress value={62} className="h-1.5 bg-white/5" />
            </div>
          </CardContent>
        </div>
      </div>

      {/* Row 2: Entity graph preview — glass */}
      <div className="rounded-xl glass-panel overflow-hidden border border-white/[0.06]">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <CardTitle className="text-sm font-sans font-semibold text-foreground flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-neon" aria-hidden />
            <span>Entity graph</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1 font-sans">
            People, locations, objects, and events. Click a node for details.
          </p>
        </div>
        <div className="p-4">
          <EntityGraph />
        </div>
      </div>

      {/* Row 3: Timeline — glass */}
      <div className="rounded-xl glass-panel overflow-hidden border border-white/[0.06]">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <CardTitle className="text-sm font-sans font-semibold text-foreground flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-neon" aria-hidden />
            <span>Timeline</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1 font-sans">
            Chronological events extracted from evidence.
          </p>
        </div>
        <div className="p-5">
          <TimelineView />
        </div>
      </div>

      {/* Activity log — monospace, glass */}
      <div className="rounded-xl glass-panel overflow-hidden border border-white/[0.06]">
        <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-2">
          <span className="w-1 h-3.5 rounded-full bg-neon" aria-hidden />
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Activity log
          </span>
        </div>
        <div className="p-4">
          <div className="font-mono text-[11px] space-y-1.5 text-muted-foreground">
            {activityLog.map((entry) => (
              <div key={`${entry.ts}-${entry.msg}`} className="flex gap-4 items-baseline">
                <span className="text-neon/90 shrink-0 tabular-nums">{entry.ts}</span>
                <span
                  className={cn(
                    entry.level === "warn" && "text-amber-400/90"
                  )}
                >
                  {entry.msg}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
