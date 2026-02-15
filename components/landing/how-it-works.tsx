"use client"

import { useEffect, useRef, useState } from "react"
import { Upload, Search, GitBranch, FileText } from "lucide-react"
import { TiltCard } from "@/components/effects/tilt-card"

const steps = [
  {
    icon: Upload,
    number: "01",
    title: "Upload Evidence",
    description:
      "Submit video footage, text logs, and audio recordings. The system ingests and indexes all evidence types.",
  },
  {
    icon: Search,
    number: "02",
    title: "Extract Events",
    description:
      "AI analyzes each piece of evidence to identify key events, entities, timestamps, and relationships.",
  },
  {
    icon: GitBranch,
    number: "03",
    title: "Build Timeline",
    description:
      "Events are chronologically ordered and cross-referenced. Entity connections are mapped into a relationship graph.",
  },
  {
    icon: FileText,
    number: "04",
    title: "Generate Narrative",
    description:
      "A comprehensive case summary is generated, connecting all evidence into a coherent investigative narrative.",
  },
]

export function HowItWorks() {
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
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative py-36 px-4"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-primary/[0.015] blur-[200px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-24">
          <p
            className={`text-xs font-sans tracking-[0.5em] uppercase text-primary mb-5 transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            Process
          </p>
          <h2
            className={`font-serif text-4xl md:text-6xl lg:text-7xl text-foreground text-balance transition-all duration-700 delay-150 glow-cyan-text ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            Core System Flow
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 perspective-1000">
          {steps.map((step, index) => (
            <TiltCard
              key={step.number}
              className={`rounded-xl transition-all duration-700 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
              intensity={10}
            >
              <div className="relative p-8 rounded-xl glass-panel glass-panel-hover overflow-hidden group">
                {/* Recessed number */}
                <span
                  className="absolute -right-3 -top-5 text-[110px] font-serif font-bold leading-none text-foreground/[0.015] group-hover:text-primary/[0.03] transition-colors duration-700 select-none"
                  aria-hidden="true"
                >
                  {step.number}
                </span>

                {/* Top edge highlight */}
                <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative flex items-start gap-5">
                  <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/[0.06] border border-primary/10 group-hover:bg-primary/[0.1] group-hover:border-primary/20 group-hover:glow-cyan-sm transition-all duration-500">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <span className="text-[10px] font-sans tracking-[0.35em] text-primary/50">
                      STEP {step.number}
                    </span>
                    <h3 className="mt-1.5 text-lg font-sans font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connection dot */}
                {index < steps.length - 1 && (
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary/20 md:hidden" />
                )}
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  )
}
