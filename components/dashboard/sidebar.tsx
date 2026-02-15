"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Upload,
  Clock,
  Network,
  FileText,
  ArrowLeft,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/upload", icon: Upload, label: "Upload Evidence" },
  { href: "/dashboard/timeline", icon: Clock, label: "Timeline" },
  { href: "/dashboard/entities", icon: Network, label: "Entity Graph" },
  { href: "/dashboard/narrative", icon: FileText, label: "Narrative" },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card/50 backdrop-blur-sm">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="w-2 h-2 rounded-full bg-primary" />
        <span className="font-serif text-lg text-foreground">Night Archivist</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-sans transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Case info */}
      <div className="px-4 py-4 border-t border-border">
        <div className="px-3 py-3 rounded-md bg-secondary/50">
          <p className="text-[10px] font-sans tracking-[0.2em] uppercase text-muted-foreground mb-1">
            Active Case
          </p>
          <p className="text-sm font-sans font-medium text-foreground">Case #2026-0214</p>
          <p className="text-xs text-muted-foreground mt-0.5">3 evidence files</p>
        </div>
      </div>

      {/* Back to home */}
      <div className="px-4 pb-4">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Home
        </Link>
      </div>
    </aside>
  )
}
