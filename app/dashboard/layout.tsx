import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { MobileNav } from "@/components/dashboard/mobile-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto pb-16 md:pb-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--neon-subtle)),transparent)]">
        {children}
      </main>
      <MobileNav />
    </div>
  )
}
