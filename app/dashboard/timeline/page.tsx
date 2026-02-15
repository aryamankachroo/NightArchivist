import { TimelineView } from "@/components/dashboard/timeline-view"

export default function TimelinePage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <p className="text-xs font-sans tracking-[0.3em] uppercase text-primary mb-2">Analysis</p>
        <h1 className="font-serif text-3xl md:text-4xl text-foreground">Event Timeline</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-lg">
          Chronologically ordered events extracted from all evidence sources. Cross-referenced and verified by AI.
        </p>
      </div>
      <TimelineView />
    </div>
  )
}
