import { Upload, Search, GitBranch, FileText } from "lucide-react"

const steps = [
  {
    icon: Upload,
    number: "01",
    title: "Upload Evidence",
    description: "Submit video footage, text logs, and audio recordings. The system ingests and indexes all evidence types.",
  },
  {
    icon: Search,
    number: "02",
    title: "Extract Events",
    description: "AI analyzes each piece of evidence to identify key events, entities, timestamps, and relationships.",
  },
  {
    icon: GitBranch,
    number: "03",
    title: "Build Timeline",
    description: "Events are chronologically ordered and cross-referenced. Entity connections are mapped into a relationship graph.",
  },
  {
    icon: FileText,
    number: "04",
    title: "Generate Narrative",
    description: "A comprehensive case summary is generated, connecting all evidence into a coherent investigative narrative.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-sans tracking-[0.3em] uppercase text-primary mb-3">Process</p>
          <h2 className="font-serif text-3xl md:text-5xl text-foreground text-balance">
            Core System Flow
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="group relative p-8 rounded-lg border border-border bg-card/50 backdrop-blur-sm transition-colors hover:border-primary/30"
            >
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 border border-primary/20">
                  <step.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <span className="text-xs font-sans tracking-[0.2em] text-muted-foreground">{step.number}</span>
                  <h3 className="mt-1 text-lg font-sans font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
