import { NarrativeView } from "@/components/dashboard/narrative-view"

export default function NarrativePage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <p className="text-xs font-sans tracking-[0.3em] uppercase text-primary mb-2">Output</p>
        <h1 className="font-serif text-3xl md:text-4xl text-foreground">Case Narrative</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-lg">
          AI-generated investigative narrative connecting all evidence into a coherent case summary.
        </p>
      </div>
      <NarrativeView />
    </div>
  )
}
