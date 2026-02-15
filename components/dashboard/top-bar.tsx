"use client"

import { Upload, Radio, Search, Bell, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function TopBar() {
  return (
    <header className="h-12 flex items-center justify-between px-4 border-b border-white/[0.04] glass noise-overlay">
      {/* Left — Logo + Live indicator */}
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#00F0FF]/10 flex items-center justify-center border border-[#00F0FF]/20">
            <div className="w-2 h-2 rounded-sm bg-[#00F0FF]" />
          </div>
          <span className="text-sm font-semibold tracking-wide text-foreground hidden sm:block">
            NIGHT ARCHIVIST
          </span>
        </Link>

        <div className="h-4 w-px bg-white/[0.06]" />

        {/* LIVE REASONING indicator */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-reasoning absolute inline-flex h-full w-full rounded-full bg-[#00F0FF] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00F0FF]" />
          </span>
          <span className="text-[10px] tracking-[0.25em] uppercase font-mono text-[#00F0FF]">
            Live Reasoning
          </span>
          <Radio className="w-3 h-3 text-[#00F0FF]/50" />
        </div>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center h-7 px-3 rounded-md glass-inset text-xs text-muted-foreground gap-2">
          <Search className="w-3 h-3" />
          <span>Search evidence...</span>
          <kbd className="text-[9px] font-mono bg-white/[0.04] border border-white/[0.06] rounded px-1 py-0.5 text-muted-foreground ml-4">
            {"/"}</kbd>
        </div>
        <Button
          size="sm"
          className="h-7 px-3 text-xs font-mono tracking-wide bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20 hover:bg-[#00F0FF]/20 hover:border-[#00F0FF]/30 transition-all"
        >
          <Upload className="w-3 h-3 mr-1.5" />
          Upload Evidence
        </Button>
        <button className="relative w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/[0.04] transition-colors" aria-label="Notifications">
          <Bell className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#00F0FF]" />
        </button>
        <button className="flex items-center gap-1.5 h-7 px-2 rounded-md hover:bg-white/[0.04] transition-colors" aria-label="Profile menu">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#00F0FF]/30 to-[#00F0FF]/5 border border-[#00F0FF]/20" />
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>
    </header>
  )
}
