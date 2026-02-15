"use client"

import { useEffect, useRef, useCallback } from "react"

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  life: number
  maxLife: number
  hue: number
}

export function ParticleField({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const rafRef = useRef<number>(0)

  const createParticle = useCallback((width: number, height: number): Particle => {
    return {
      x: Math.random() * width,
      y: height + Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -(0.15 + Math.random() * 0.4),
      size: 1 + Math.random() * 2.5,
      opacity: 0,
      life: 0,
      maxLife: 400 + Math.random() * 500,
      hue: 165 + Math.random() * 20,
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }
    resize()

    const rect = canvas.getBoundingClientRect()
    const particleCount = Math.min(80, Math.floor(rect.width / 16))
    particlesRef.current = Array.from({ length: particleCount }, () =>
      createParticle(rect.width, rect.height)
    )
    particlesRef.current.forEach((p, i) => {
      p.life = (i / particleCount) * p.maxLife
      p.y = rect.height - (p.life / p.maxLife) * rect.height * 1.3
    })

    const handleMouse = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top }
    }

    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 }
    }

    const animate = () => {
      const r = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, r.width, r.height)

      particlesRef.current.forEach((p) => {
        p.life++
        if (p.life > p.maxLife) {
          Object.assign(p, createParticle(r.width, r.height))
          return
        }

        const lifeRatio = p.life / p.maxLife
        p.opacity = lifeRatio < 0.1 ? lifeRatio * 10 : lifeRatio > 0.85 ? (1 - lifeRatio) * 6.67 : 1

        // Mouse attraction (gentle pull instead of repulsion)
        const dx = mouseRef.current.x - p.x
        const dy = mouseRef.current.y - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 150 && dist > 0) {
          const force = (150 - dist) / 150
          p.vx += (dx / dist) * force * 0.015
          p.vy += (dy / dist) * force * 0.015
        }

        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.992
        p.vy *= 0.996

        // Draw particle with glow
        ctx.save()
        ctx.shadowColor = `hsla(${p.hue}, 100%, 50%, ${p.opacity * 0.5})`
        ctx.shadowBlur = 8
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${p.opacity * 0.35})`
        ctx.fill()
        ctx.restore()

        // Connect nearby particles
        particlesRef.current.forEach((p2) => {
          if (p === p2) return
          const d = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2)
          if (d < 120) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `hsla(170, 100%, 55%, ${(1 - d / 120) * 0.1 * p.opacity})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      rafRef.current = requestAnimationFrame(animate)
    }

    window.addEventListener("resize", resize)
    canvas.addEventListener("mousemove", handleMouse)
    canvas.addEventListener("mouseleave", handleMouseLeave)
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", resize)
      canvas.removeEventListener("mousemove", handleMouse)
      canvas.removeEventListener("mouseleave", handleMouseLeave)
      cancelAnimationFrame(rafRef.current)
    }
  }, [createParticle])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-auto ${className}`}
      aria-hidden="true"
    />
  )
}
