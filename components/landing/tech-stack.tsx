import { Monitor, Server, Cpu, Database } from "lucide-react"

const stack = [
  {
    icon: Monitor,
    category: "Frontend",
    tech: "Next.js Dashboard UI",
    description: "Modern reactive interface with real-time updates and interactive visualizations.",
  },
  {
    icon: Server,
    category: "Backend",
    tech: "Python API + Pipeline",
    description: "Robust processing pipeline for evidence ingestion, extraction, and analysis.",
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
    description: "Caching and session management with local file system storage for evidence files.",
  },
]

export function TechStack() {
  return (
    <section className="relative py-24 px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-sans tracking-[0.3em] uppercase text-primary mb-3">Architecture</p>
          <h2 className="font-serif text-3xl md:text-5xl text-foreground text-balance">
            Technology Stack
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stack.map((item) => (
            <div
              key={item.category}
              className="relative p-6 rounded-lg border border-border bg-card/30 backdrop-blur-sm group hover:border-primary/30 transition-colors"
            >
              <item.icon className="w-5 h-5 text-primary mb-4" />
              <p className="text-[10px] font-sans tracking-[0.3em] uppercase text-muted-foreground mb-1">
                {item.category}
              </p>
              <h3 className="text-sm font-sans font-semibold text-foreground mb-2">{item.tech}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
