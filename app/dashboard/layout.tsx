import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { MobileNav } from "@/components/dashboard/mobile-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen bg-background">
      {/* Ambient background — glows for glassmorphism depth */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[15%] w-[700px] h-[700px] rounded-full bg-primary/[0.025] blur-[200px]" />
        <div className="absolute bottom-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-[hsla(260,70%,55%,0.015)] blur-[180px]" />
        <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full bg-primary/[0.01] blur-[120px]" />
      </div>

      <DashboardSidebar />
      <main className="relative z-10 flex-1 overflow-auto pb-16 md:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  )
}
