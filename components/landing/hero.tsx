"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Eye, Shield, Clock, Scan, Crosshair } from "lucide-react"
import Link from "next/link"
import { ParticleField } from "@/components/effects/particle-field"
import { TiltCard } from "@/components/effects/tilt-card"

export function Hero() {
  const [typedText, setTypedText] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const [mounted, setMounted] = useState(false)
  const fullText = "Reconstruct truth from fragmented evidence."

  useEffect(() => {
    setMounted(true)
    let i = 0
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i + 1))
      i++
      if (i >= fullText.length) {
        clearInterval(interval)
        setTimeout(() => setShowCursor(false), 2000)
      }
    }, 30)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Particle field */}
      <ParticleField className="z-0" />

      {/* Layered ambient glows */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full bg-primary/[0.03] blur-[180px] animate-glow-pulse" />
        <div className="absolute bottom-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-[hsla(260,70%,50%,0.02)] blur-[140px] animate-glow-pulse" style={{ animationDelay: "2s" }} />
        {/* Scan line */}
        <div className="absolute left-0 right-0 h-[1px] bg-primary/[0.04] animate-scan-line" />
      </div>

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none z-[1] opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsla(170, 100%, 45%, 0.4) 1px, transparent 1px), linear-gradient(90deg, hsla(170, 100%, 45%, 0.4) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Bottom horizon glow */}
      <div className="absolute bottom-0 left-0 right-0 z-[2]">
        <div className="h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent glow-cyan-line" />
        <div className="h-24 bg-gradient-to-t from-primary/[0.02] to-transparent" />
      </div>

      {/* Status pill */}
      <div
        className={`relative z-10 flex items-center gap-3 mb-16 px-5 py-2.5 rounded-full glass-panel animate-glow-breathe transition-all duration-1000 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
        </span>
        <span className="text-[10px] font-sans tracking-[0.35em] uppercase text-muted-foreground">
          System Online
        </span>
        <span className="w-px h-3 bg-border" />
        <Scan className="w-3 h-3 text-muted-foreground" />
        <span className="text-[10px] font-sans text-muted-foreground">v2.0</span>
      </div>

      {/* Main title with 3D perspective */}
      <div className="relative z-10 perspective-2000">
        <h1
          className={`font-serif text-6xl md:text-8xl lg:text-[10rem] tracking-tight text-center text-balance preserve-3d transition-all duration-1000 delay-200 leading-none ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <span className="text-foreground block">Night</span>
          <span className="text-primary animate-flicker block glow-cyan-text">
            Archivist
          </span>
        </h1>
        {/* 3D shadow text behind */}
        <div
          className="absolute inset-0 font-serif text-6xl md:text-8xl lg:text-[10rem] tracking-tight text-center leading-none pointer-events-none select-none"
          aria-hidden="true"
          style={{ transform: "translateZ(-60px) translateY(4px)", opacity: 0.04 }}
        >
          <span className="text-primary block">Night</span>
          <span className="text-primary block">Archivist</span>
        </div>
      </div>

      {/* Decorative crosshair */}
      <div
        className={`relative z-10 my-8 transition-all duration-1000 delay-300 ${
          mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"
        }`}
      >
        <Crosshair className="w-6 h-6 text-primary/30 animate-spin" style={{ animationDuration: "12s" }} />
      </div>

      {/* Subtitle with typing effect */}
      <p
        className={`relative z-10 text-lg md:text-xl text-muted-foreground text-center font-sans max-w-xl min-h-[2rem] transition-all duration-1000 delay-400 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {typedText}
        {showCursor && (
          <span className="inline-block w-[2px] h-5 bg-primary ml-1 animate-typewriter-blink" />
        )}
      </p>

      {/* CTA buttons */}
      <div
        className={`relative z-10 mt-14 flex flex-col sm:flex-row gap-4 transition-all duration-1000 delay-500 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <Link href="/dashboard">
          <Button
            size="lg"
            className="gap-2 text-sm tracking-wider uppercase font-sans relative overflow-hidden group glow-cyan-sm"
          >
            <span className="relative z-10 flex items-center gap-2">
              Open Dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </Link>
        <Link href="#how-it-works">
          <Button
            variant="outline"
            size="lg"
            className="gap-2 text-sm tracking-wider uppercase font-sans text-foreground border-border hover:border-primary/30 hover:bg-primary/5 transition-all"
          >
            How It Works
          </Button>
        </Link>
      </div>

      {/* 3D Feature cards */}
      <div
        className={`relative z-10 mt-28 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full perspective-1000 transition-all duration-1000 delay-700 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
      >
        {[
          { icon: Eye, label: "Multimodal Analysis", desc: "Video, text, and audio evidence processing" },
          { icon: Clock, label: "Timeline Reconstruction", desc: "Automated chronological event extraction" },
          { icon: Shield, label: "Narrative Generation", desc: "AI-powered investigative case summaries" },
        ].map((feature, i) => (
          <TiltCard key={feature.label} className="rounded-xl" intensity={14}>
            <div className="relative flex flex-col items-center gap-5 p-8 rounded-xl glass-panel glass-panel-hover text-center overflow-hidden">
              {/* Top edge glow line */}
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/[0.08] border border-primary/15 glow-cyan-sm">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-sans font-semibold text-foreground tracking-wide">{feature.label}</span>
              <span className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</span>

              {/* Bottom floating indicator */}
              <div className="flex items-center gap-1 mt-1">
                {[0, 1, 2].map((dot) => (
                  <div
                    key={dot}
                    className="w-1 h-1 rounded-full bg-primary/30"
                    style={{ opacity: dot <= i ? 1 : 0.3 }}
                  />
                ))}
              </div>
            </div>
          </TiltCard>
        ))}
      </div>
    </section>
  )
}
