"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  Copy,
  Check,
  FileText,
  Clock,
  Users,
  AlertTriangle,
} from "lucide-react"
import { AnimatedCounter } from "@/components/effects/animated-counter"

const narrativeParagraphs = [
  "The night of February 10th, 2026 began like any other at the Meridian Research Facility\u2014silent corridors, humming servers, and the steady pulse of fluorescent lights. But somewhere between 9:14 PM and 9:45 PM, the ordinary fractured into something far more calculated.",
  "At precisely 9:14 PM, surveillance camera 03 captured a lone figure\u2014designated Subject A\u2014entering through the east entrance. No badge scan registered. The subject carried a dark briefcase, moving with the deliberate calm of someone who had rehearsed this route. The east entrance, typically secured by dual-factor authentication, presented no resistance.",
  "Four minutes later, the facility's access control system flagged an anomaly: three consecutive invalid badge attempts at the server room door on the third floor. The badge ID matched no registered employee, suggesting either a cloned credential or a deliberately corrupted key. The system entered timeout, but no alarm was triggered\u2014an oversight that would prove significant.",
  "At 9:22 PM, an audio intercept captured a brief but telling exchange in the third-floor hallway. Two voices: Subject A, and a second individual\u2014designated Subject B\u2014possibly female. The conversation referenced 'the package' and confirmed the third floor as the operational zone. This interchange suggests pre-coordination and a level of familiarity between the subjects.",
  "Nine minutes later, the building management system recorded a 4-second power interruption isolated to the third floor. Emergency lighting flickered to life, then subsided. More critically, all surveillance cameras on that floor went dark during this window. The precision of the timing\u2014coinciding exactly with the gap between security patrol rotations\u2014points to insider knowledge of facility operations.",
  "By 9:45 PM, Subject A was captured exiting through the south stairwell. The briefcase was no longer visible. The exit door alarm, which should have triggered upon unauthorized egress, remained silent. Subject A moved quickly but without panic, suggesting confidence in the operation's success.",
]

const caseMetadata = {
  caseId: "#2026-0214",
  classification: "Priority Alpha",
  generated: "Feb 14, 2026 at 03:22 AM",
  evidenceSources: 3,
  eventsAnalyzed: 5,
  entitiesIdentified: 4,
  confidenceScore: 87,
}

const keyFindings = [
  { label: "Unauthorized facility access via east entrance", severity: "high" },
  { label: "Server room breach attempt with cloned credentials", severity: "critical" },
  { label: "Pre-coordinated operation involving two subjects", severity: "high" },
  { label: "Precision power disruption targeting surveillance", severity: "critical" },
  { label: "Evidence of insider knowledge of security protocols", severity: "high" },
]

export function NarrativeView() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentParagraph, setCurrentParagraph] = useState(-1)
  const [copied, setCopied] = useState(false)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startNarration = () => {
    setIsPlaying(true)
    setCurrentParagraph(0)
    setProgress(0)

    let para = 0
    intervalRef.current = setInterval(() => {
      para++
      if (para >= narrativeParagraphs.length) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setIsPlaying(false)
        setCurrentParagraph(-1)
        setProgress(100)
        return
      }
      setCurrentParagraph(para)
      setProgress(Math.round(((para + 1) / narrativeParagraphs.length) * 100))
    }, 4000)
  }

  const stopNarration = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setIsPlaying(false)
    setCurrentParagraph(-1)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(narrativeParagraphs.join("\n\n"))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
      {/* Main narrative */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {/* Audio player */}
        <div className="rounded-xl glass-neon overflow-hidden relative">
          <div className="py-5 px-6">
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                variant={isPlaying ? "secondary" : "default"}
                className={`w-10 h-10 p-0 rounded-lg ${!isPlaying ? "glow-cyan-sm" : ""}`}
                onClick={isPlaying ? stopNarration : startNarration}
                aria-label={isPlaying ? "Pause narration" : "Play narration"}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>

              <div className="flex-1">
                <div className="h-2 rounded-full glass-inset overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      boxShadow: progress > 0 ? "0 0 12px hsla(170, 100%, 45%, 0.4)" : "none",
                    }}
                  />
                </div>
              </div>

              <Button
                size="sm"
                variant="ghost"
                className="w-10 h-10 p-0 text-muted-foreground hover:text-primary"
                onClick={() => setIsMuted(!isMuted)}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>

              <span className="text-[10px] font-sans text-muted-foreground whitespace-nowrap tracking-wide">
                Narrated by ElevenLabs AI
              </span>
            </div>
          </div>
        </div>

        {/* Narrative text */}
        <div className="rounded-xl glass-panel glass-panel-hover overflow-hidden relative">
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <h3 className="text-sm font-sans font-semibold text-foreground">
              Investigative Summary
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="gap-1.5 text-xs text-muted-foreground hover:text-primary"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs text-muted-foreground hover:text-primary"
              >
                <Download className="w-3 h-3" />
                Export
              </Button>
            </div>
          </div>
          <div className="px-6 pb-6">
            <div className="flex flex-col gap-6">
              {narrativeParagraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className={`text-sm leading-relaxed font-sans transition-all duration-700 ${
                    currentParagraph === index
                      ? "text-foreground bg-primary/[0.04] -mx-4 px-4 py-3 rounded-lg border-l-2 border-primary"
                      : currentParagraph >= 0 && currentParagraph !== index
                      ? "text-muted-foreground/30"
                      : "text-muted-foreground"
                  }`}
                  style={
                    currentParagraph === index
                      ? { boxShadow: "inset 0 0 30px -15px hsla(170, 100%, 45%, 0.08)" }
                      : {}
                  }
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-4">
        {/* Case metadata */}
        <div className="rounded-xl glass-neon p-5 relative">
          <h3 className="text-sm font-sans font-semibold text-foreground flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-muted-foreground" />
            Case Metadata
          </h3>

          <dl className="flex flex-col gap-3">
            {[
              { label: "Case ID", value: caseMetadata.caseId },
              { label: "Classification", value: caseMetadata.classification },
              { label: "Generated", value: caseMetadata.generated },
            ].map((item) => (
              <div key={item.label}>
                <dt className="text-[10px] font-sans tracking-[0.25em] uppercase text-muted-foreground">
                  {item.label}
                </dt>
                <dd className="text-sm font-sans text-foreground mt-0.5">{item.value}</dd>
              </div>
            ))}
          </dl>

          <Separator className="my-4 bg-border/40" />

          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { icon: FileText, label: "Sources", value: caseMetadata.evidenceSources },
              { icon: Clock, label: "Events", value: caseMetadata.eventsAnalyzed },
              { icon: Users, label: "Entities", value: caseMetadata.entitiesIdentified },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1.5 p-2 rounded-lg glass-inset">
                <stat.icon className="w-3.5 h-3.5 text-primary/50" />
                <span className="text-xl font-sans font-bold text-foreground">
                  <AnimatedCounter value={stat.value} />
                </span>
                <span className="text-[10px] text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>

          <Separator className="my-4 bg-border/40" />

          <div>
            <p className="text-[10px] font-sans tracking-[0.25em] uppercase text-muted-foreground mb-2.5">
              AI Confidence
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full glass-inset overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary"
                  style={{
                    width: `${caseMetadata.confidenceScore}%`,
                    boxShadow: "0 0 12px hsla(170, 100%, 45%, 0.3)",
                  }}
                />
              </div>
              <span className="text-sm font-sans font-bold text-primary drop-shadow-[0_0_8px_hsla(170,100%,45%,0.5)]">
                <AnimatedCounter value={caseMetadata.confidenceScore} suffix="%" />
              </span>
            </div>
          </div>
        </div>

        {/* Key findings */}
        <div className="rounded-xl glass-panel glass-panel-hover p-5 relative">
          <h3 className="text-sm font-sans font-semibold text-foreground flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
            Key Findings
          </h3>

          <ul className="flex flex-col gap-3">
            {keyFindings.map((finding, i) => (
              <li key={i} className="flex items-start gap-3 group">
                <div className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary group-hover:glow-cyan-sm transition-shadow" />
                <div className="flex-1">
                  <p className="text-xs leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors">
                    {finding.label}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    finding.severity === "critical"
                      ? "bg-red-500/10 text-red-400 border-red-500/20 text-[10px]"
                      : "bg-primary/10 text-primary border-primary/20 text-[10px]"
                  }
                >
                  {finding.severity}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
