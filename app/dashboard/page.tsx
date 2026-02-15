import { CaseOverview } from "@/components/dashboard/case-overview"

export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-10">
      <div className="mb-10">
        <p className="text-xs font-sans tracking-[0.4em] uppercase text-primary mb-2">Dashboard</p>
        <h1 className="font-serif text-3xl md:text-4xl text-foreground glow-cyan-text">
          Case Overview
        </h1>
      </div>
      <CaseOverview />
    </div>
  )
}
