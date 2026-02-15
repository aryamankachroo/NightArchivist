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
} from "lucide-react"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/dashboard/upload", icon: Upload, label: "Upload" },
  { href: "/dashboard/timeline", icon: Clock, label: "Timeline" },
  { href: "/dashboard/entities", icon: Network, label: "Entities" },
  { href: "/dashboard/narrative", icon: FileText, label: "Narrative" },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 glass-panel">
      <ul className="flex items-center justify-around py-2.5">
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
                  "relative flex flex-col items-center gap-1 px-3 py-1.5 text-[10px] font-sans transition-all",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className={cn(
                  "w-4 h-4",
                  isActive && "drop-shadow-[0_0_8px_hsla(170,100%,45%,0.5)]"
                )} />
                {item.label}
                {isActive && (
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full bg-primary glow-cyan-sm" />
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
