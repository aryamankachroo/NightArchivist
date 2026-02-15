"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
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

const stats = [
  { label: "Evidence Files", value: "3", icon: FileText, detail: "1 video, 1 text, 1 audio" },
  { label: "Events Extracted", value: "5", icon: Clock, detail: "Across all sources" },
  { label: "Entities Found", value: "4", icon: Users, detail: "People, locations, objects" },
  { label: "Anomalies", value: "1", icon: AlertTriangle, detail: "Requires review" },
]

const recentEvidence = [
  {
    name: "surveillance_cam_03.mp4",
    type: "Video",
    icon: FileVideo,
    status: "Processed",
    events: 3,
  },
  {
    name: "witness_statement.txt",
    type: "Text",
    icon: FileText,
    status: "Processed",
    events: 2,
  },
  {
    name: "radio_intercept.wav",
    type: "Audio",
    icon: Mic,
    status: "Pending",
    events: 0,
  },
]

export function CaseOverview() {
  return (
    <div className="flex flex-col gap-6">
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-sans tracking-wide uppercase text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-3xl font-sans font-bold text-foreground">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.detail}</p>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                  <stat.icon className="w-4 h-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evidence list */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-sm font-sans font-semibold text-foreground">
              Recent Evidence
            </CardTitle>
            <Link href="/dashboard/upload">
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-primary">
                Upload New <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {recentEvidence.map((item) => (
                <li
                  key={item.name}
                  className="flex items-center gap-4 p-3 rounded-md bg-secondary/30 border border-border"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary/10">
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
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-secondary text-muted-foreground"
                    }
                  >
                    {item.status}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Processing status */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-sans font-semibold text-foreground">
              Processing Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                    <span className="text-xs font-sans text-muted-foreground">{step.progress}%</span>
                  </div>
                  <Progress value={step.progress} className="h-1.5 bg-secondary" />
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-2 p-3 rounded-md bg-primary/5 border border-primary/10">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-sans text-muted-foreground">
                Processing in progress... Estimated 2 min remaining
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
