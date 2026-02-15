import { Hero } from "@/components/landing/hero"
import { HowItWorks } from "@/components/landing/how-it-works"
import { TechStack } from "@/components/landing/tech-stack"
import { Footer } from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <HowItWorks />
      <TechStack />
      <Footer />
    </main>
  )
}
