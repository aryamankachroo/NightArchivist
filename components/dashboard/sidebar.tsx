"use client"

import { useState } from "react"
import {
  Briefcase,
  FileText,
  Clock,
  GitBranch,
  ChevronRight,
  Plus,
  FolderOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const NAV_ITEMS = [
  { id: "cases", icon: Briefcase, label: "Cases" },
  { id: "evidence", icon: FileText, label: "Evidence" },
  { id: "timeline", icon: Clock, label: "Timeline" },
  { id: "graph", icon: GitBranch, label: "Graph" },
]

const RECENT_CASES = [
  { id: 1, name: "Whitmore Incident", status: "active", events: 12 },
  { id: 2, name: "Harbor District Fire", status: "reviewing", events: 8 },
  { id: 3, name: "Missing Witness #47", status: "closed", events: 23 },
]

export function DashboardSidebar() {
  const [active, setActive] = useState("graph")

  return (
    <aside className="hidden lg:flex flex-col w-56 border-r border-white/[0.04] glass noise-overlay shrink-0">
      {/* Nav */}
      <nav className="p-3 space-y-0.5">
        <p className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground font-mono px-2 pb-2 pt-1">
          Navigate
        </p>
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 group relative",
                isActive
                  ? "text-[#00F0FF] bg-[#00F0FF]/[0.06]"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full bg-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.5)]" />
              )}
              <item.icon className={cn("w-3.5 h-3.5 transition-colors", isActive && "drop-shadow-[0_0_4px_rgba(0,240,255,0.5)]")} />
              {item.label}
              {isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-40" />}
            </button>
          )
        })}
      </nav>

      <div className="mx-3 h-px bg-white/[0.04]" />

      {/* Recent cases */}
      <div className="flex-1 p-3 overflow-y-auto">
        <div className="flex items-center justify-between px-2 pb-2">
          <p className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground font-mono">
            Recent Cases
          </p>
          <button className="w-4 h-4 flex items-center justify-center rounded bg-white/[0.04] hover:bg-[#00F0FF]/10 transition-colors" aria-label="New case">
            <Plus className="w-2.5 h-2.5 text-muted-foreground" />
          </button>
        </div>
        <div className="space-y-1">
          {RECENT_CASES.map((c) => (
            <button
              key={c.id}
              className="w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.03] transition-all group text-left"
            >
              <FolderOpen className="w-3.5 h-3.5 mt-0.5 text-muted-foreground group-hover:text-[#00F0FF]/60 transition-colors shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-foreground truncate">{c.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full shrink-0",
                    c.status === "active" && "bg-[#00F0FF] shadow-[0_0_4px_rgba(0,240,255,0.5)]",
                    c.status === "reviewing" && "bg-amber-400",
                    c.status === "closed" && "bg-muted-foreground/50"
                  )} />
                  <span className="text-[10px] text-muted-foreground capitalize">{c.status}</span>
                  <span className="text-[10px] text-muted-foreground/50">{c.events} events</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="p-3 border-t border-white/[0.04]">
        <div className="glass-inset rounded-lg p-2.5">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
            AI Engine Online
          </div>
          <div className="text-[10px] text-muted-foreground/50 font-mono mt-1">Model: NA-7B v2.4</div>
        </div>
        <Link href="/" className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-[#00F0FF] transition-colors mt-2 px-1 font-mono">
          Back to Home
        </Link>
      </div>
    </aside>
  )
}
