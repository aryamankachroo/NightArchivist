"use client"

import { useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface TiltCardProps {
  children: ReactNode
  className?: string
  glowColor?: string
  intensity?: number
}

export function TiltCard({
  children,
  className,
  glowColor = "hsla(170, 100%, 50%, 0.12)",
  intensity = 12,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState("")
  const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 })
  const [isHovering, setIsHovering] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return

    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    const rotateX = (y - 0.5) * -intensity
    const rotateY = (x - 0.5) * intensity
    const translateZ = 20

    setTransform(
      `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px) scale3d(1.02, 1.02, 1.02)`
    )
    setGlowPosition({ x: x * 100, y: y * 100 })
    setIsHovering(true)
  }

  const handleMouseLeave = () => {
    setTransform("perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)")
    setIsHovering(false)
  }

  return (
    <div
      ref={cardRef}
      className={cn("relative group transition-all duration-500 ease-out", className)}
      style={{
        transform,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glow spotlight that follows mouse */}
      <div
        className="absolute inset-0 rounded-[inherit] transition-opacity duration-500 pointer-events-none z-0"
        style={{
          opacity: isHovering ? 1 : 0,
          background: `radial-gradient(ellipse at ${glowPosition.x}% ${glowPosition.y}%, ${glowColor}, transparent 55%)`,
        }}
      />
      {/* Reflection edge highlight */}
      <div
        className="absolute inset-0 rounded-[inherit] transition-opacity duration-500 pointer-events-none z-0"
        style={{
          opacity: isHovering ? 0.5 : 0,
          background: `linear-gradient(${135 + (glowPosition.x - 50) * 0.5}deg, hsla(170, 100%, 80%, 0.05) 0%, transparent 50%)`,
        }}
      />
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
