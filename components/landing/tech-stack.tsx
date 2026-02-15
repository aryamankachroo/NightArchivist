"use client"

import { useEffect, useRef, useState } from "react"
import { Monitor, Server, Cpu, Database } from "lucide-react"
import { TiltCard } from "@/components/effects/tilt-card"

const stack = [
  {
    icon: Monitor,
    category: "Frontend",
    tech: "Next.js Dashboard UI",
    description:
      "Modern reactive interface with real-time updates and interactive visualizations.",
  },
  {
    icon: Server,
    category: "Backend",
    tech: "Python API + Pipeline",
    description:
      "Robust processing pipeline for evidence ingestion, extraction, and analysis.",
  },
  {
    icon: Cpu,
    category: "AI APIs",
    tech: "TwelveLabs, Gemini, ElevenLabs",
    description: "Video understanding, reasoning and synthesis, and voice narration.",
  },
  {
    icon: Database,
    category: "Data Layer",
    tech: "Valkey + Local Storage",
    description:
      "Caching and session management with local file system storage for evidence files.",
  },
]

export function TechStack() {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-36 px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
        <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[600px] rounded-full bg-[hsla(260,70%,50%,0.015)] blur-[160px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-24">
          <p
            className={`text-xs font-sans tracking-[0.5em] uppercase text-primary mb-5 transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            Architecture
          </p>
          <h2
            className={`font-serif text-4xl md:text-6xl lg:text-7xl text-foreground text-balance transition-all duration-700 delay-150 glow-cyan-text ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            Technology Stack
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 perspective-1000">
          {stack.map((item, index) => (
            <TiltCard
              key={item.category}
              className={`rounded-xl transition-all duration-700 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: `${index * 120}ms` }}
              intensity={12}
            >
              <div className="relative h-full p-7 rounded-xl glass-panel glass-panel-hover overflow-hidden group">
                {/* Top edge highlight */}
                <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Icon with inset bg */}
                <div className="flex items-center justify-center w-12 h-12 rounded-xl glass-inset mb-6 group-hover:glow-cyan-sm transition-all duration-500">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>

                <p className="text-[10px] font-sans tracking-[0.35em] uppercase text-primary/50 mb-2">
                  {item.category}
                </p>
                <h3 className="text-sm font-sans font-semibold text-foreground mb-3">
                  {item.tech}
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {item.description}
                </p>

                {/* Bottom accent */}
                <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  )
}
