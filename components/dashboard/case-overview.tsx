"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  FileVideo,
  FileText,
  Mic,
  Clock,
  Users,
  AlertTriangle,
  ArrowRight,
} from "lucide-react"
import { TiltCard } from "@/components/effects/tilt-card"
import { AnimatedCounter } from "@/components/effects/animated-counter"

const stats = [
  { label: "Evidence Files", value: 3, icon: FileText, detail: "1 video, 1 text, 1 audio" },
  { label: "Events Extracted", value: 5, icon: Clock, detail: "Across all sources" },
  { label: "Entities Found", value: 4, icon: Users, detail: "People, locations, objects" },
  { label: "Anomalies", value: 1, icon: AlertTriangle, detail: "Requires review" },
]

const recentEvidence = [
  { name: "surveillance_cam_03.mp4", type: "Video", icon: FileVideo, status: "Processed", events: 3 },
  { name: "witness_statement.txt", type: "Text", icon: FileText, status: "Processed", events: 2 },
  { name: "radio_intercept.wav", type: "Audio", icon: Mic, status: "Pending", events: 0 },
]

export function CaseOverview() {
  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 perspective-1000">
        {stats.map((stat) => (
          <TiltCard key={stat.label} className="rounded-xl" intensity={10}>
            <div className="relative p-6 rounded-xl glass-panel glass-panel-hover overflow-hidden group">
              {/* Hover glow orb */}
              <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-primary/[0.04] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {/* Top edge */}
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-sans tracking-[0.3em] uppercase text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="mt-3 text-4xl font-sans font-bold text-foreground">
                    <AnimatedCounter value={stat.value} />
                  </p>
                  <p className="mt-1.5 text-xs text-muted-foreground">{stat.detail}</p>
                </div>
                <div className="flex items-center justify-center w-11 h-11 rounded-xl glass-inset group-hover:glow-cyan-sm transition-all duration-500">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
            </div>
          </TiltCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evidence list */}
        <div className="rounded-xl glass-panel glass-panel-hover overflow-hidden relative">
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <h3 className="text-sm font-sans font-semibold text-foreground">
              Recent Evidence
            </h3>
            <Link href="/dashboard/upload">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-primary hover:bg-primary/10 group">
                Upload New <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </div>
          <div className="px-6 pb-6">
            <ul className="flex flex-col gap-3">
              {recentEvidence.map((item) => (
                <li
                  key={item.name}
                  className="flex items-center gap-4 p-4 rounded-lg glass-inset hover:border-primary/15 transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/[0.06] border border-primary/10 group-hover:glow-cyan-sm transition-all duration-500">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-sans font-medium text-foreground truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.type} &middot; {item.events} events
                    </p>
                  </div>
                  <Badge
                    variant={item.status === "Processed" ? "default" : "secondary"}
                    className={
                      item.status === "Processed"
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "bg-secondary text-muted-foreground border border-border/40"
                    }
                  >
                    {item.status}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Processing pipeline */}
        <div className="rounded-xl glass-neon overflow-hidden relative">
          <div className="px-6 pt-6 pb-4">
            <h3 className="text-sm font-sans font-semibold text-foreground">
              Processing Pipeline
            </h3>
          </div>
          <div className="px-6 pb-6">
            <div className="flex flex-col gap-5">
              {[
                { stage: "Evidence Ingestion", progress: 100 },
                { stage: "Event Extraction", progress: 80 },
                { stage: "Entity Recognition", progress: 65 },
                { stage: "Timeline Construction", progress: 40 },
                { stage: "Narrative Generation", progress: 10 },
              ].map((step) => (
                <div key={step.stage} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-sans text-foreground">{step.stage}</span>
                    <span className="text-xs font-sans font-medium text-primary">
                      <AnimatedCounter value={step.progress} suffix="%" duration={1000} />
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full glass-inset overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-1000"
                      style={{
                        width: `${step.progress}%`,
                        boxShadow: step.progress > 40 ? "0 0 12px hsla(170, 100%, 45%, 0.3)" : "none",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-3 p-4 rounded-lg glass-inset border-primary/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-40" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-xs font-sans text-muted-foreground">
                Processing in progress... Estimated 2 min remaining
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
