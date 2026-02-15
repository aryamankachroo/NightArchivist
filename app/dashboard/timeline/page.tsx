import { TimelineView } from "@/components/dashboard/timeline-view"

export default function TimelinePage() {
  return (
    <div className="p-6 lg:p-10">
      <div className="mb-10">
        <p className="text-xs font-sans tracking-[0.4em] uppercase text-primary mb-2">Analysis</p>
        <h1 className="font-serif text-3xl md:text-4xl text-foreground glow-cyan-text">
          Event Timeline
        </h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-lg leading-relaxed">
          Chronologically ordered events extracted from all evidence sources. Cross-referenced and verified by AI.
        </p>
      </div>
      <TimelineView />
    </div>
  )
}
