"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Eye, Shield, Clock } from "lucide-react"
import Link from "next/link"

export function Hero() {
  const [typedText, setTypedText] = useState("")
  const fullText = "Reconstruct truth from fragmented evidence."

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i + 1))
      i++
      if (i >= fullText.length) clearInterval(interval)
    }, 40)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      {/* Status bar */}
      <div className="relative flex items-center gap-2 mb-12 px-4 py-2 rounded-full border border-border bg-card/50 backdrop-blur-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-sans tracking-widest uppercase text-muted-foreground">
          System Online
        </span>
      </div>

      {/* Main title */}
      <h1 className="relative font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight text-center text-balance">
        <span className="text-foreground">Night</span>{" "}
        <span className="text-primary">Archivist</span>
      </h1>

      {/* Subtitle with typing effect */}
      <p className="mt-6 text-lg md:text-xl text-muted-foreground text-center font-sans max-w-xl min-h-[2rem]">
        {typedText}
        <span className="inline-block w-0.5 h-5 bg-primary ml-0.5 animate-pulse" />
      </p>

      {/* CTA buttons */}
      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <Link href="/dashboard">
          <Button size="lg" className="gap-2 text-sm tracking-wide uppercase font-sans">
            Open Dashboard
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <Link href="#how-it-works">
          <Button variant="outline" size="lg" className="gap-2 text-sm tracking-wide uppercase font-sans text-foreground">
            How It Works
          </Button>
        </Link>
      </div>

      {/* Feature pills */}
      <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full">
        {[
          { icon: Eye, label: "Multimodal Analysis", desc: "Video, text, and audio evidence" },
          { icon: Clock, label: "Timeline Reconstruction", desc: "Automated event extraction" },
          { icon: Shield, label: "Narrative Generation", desc: "AI-powered case summaries" },
        ].map((feature) => (
          <div
            key={feature.label}
            className="flex flex-col items-center gap-3 p-6 rounded-lg border border-border bg-card/30 backdrop-blur-sm text-center"
          >
            <feature.icon className="w-5 h-5 text-primary" />
            <span className="text-sm font-sans font-medium text-foreground">{feature.label}</span>
            <span className="text-xs text-muted-foreground">{feature.desc}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
