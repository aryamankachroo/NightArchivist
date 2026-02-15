import { EntityGraph } from "@/components/dashboard/entity-graph"

export default function EntitiesPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <p className="text-xs font-sans tracking-[0.3em] uppercase text-primary mb-2">Connections</p>
        <h1 className="font-serif text-3xl md:text-4xl text-foreground">Entity Graph</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-lg">
          Identified entities and their relationships across all evidence sources. Connections are weighted by frequency and confidence.
        </p>
      </div>
      <EntityGraph />
    </div>
  )
}
