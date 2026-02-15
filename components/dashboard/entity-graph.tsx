"use client"

import { useRef, useEffect, useState, useCallback } from "react"

interface Node {
  id: string
  label: string
  type: "person" | "location" | "event" | "evidence"
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  connections: string[]
}

const TYPE_COLORS: Record<string, { fill: string; glow: string }> = {
  person:   { fill: "#00F0FF", glow: "rgba(0,240,255,0.4)" },
  location: { fill: "#A78BFA", glow: "rgba(167,139,250,0.4)" },
  event:    { fill: "#F59E0B", glow: "rgba(245,158,11,0.4)" },
  evidence: { fill: "#EF4444", glow: "rgba(239,68,68,0.4)" },
}

const NODES: Node[] = [
  { id: "n1", label: "Whitmore", type: "person", x: 0.48, y: 0.36, vx: 0, vy: 0, radius: 24, connections: ["n2","n3","n5"] },
  { id: "n2", label: "Harbor Dist.", type: "location", x: 0.22, y: 0.26, vx: 0, vy: 0, radius: 19, connections: ["n1","n4","n7"] },
  { id: "n3", label: "Doc #14", type: "evidence", x: 0.74, y: 0.22, vx: 0, vy: 0, radius: 17, connections: ["n1","n6"] },
  { id: "n4", label: "Explosion", type: "event", x: 0.2, y: 0.62, vx: 0, vy: 0, radius: 21, connections: ["n2","n5"] },
  { id: "n5", label: "Agent Lee", type: "person", x: 0.52, y: 0.68, vx: 0, vy: 0, radius: 19, connections: ["n1","n4","n6"] },
  { id: "n6", label: "Warehouse", type: "location", x: 0.78, y: 0.56, vx: 0, vy: 0, radius: 18, connections: ["n3","n5"] },
  { id: "n7", label: "Witness B", type: "person", x: 0.12, y: 0.44, vx: 0, vy: 0, radius: 15, connections: ["n2","n4"] },
]

export function EntityGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodesRef = useRef<Node[]>([])
  const [hovered, setHovered] = useState<string | null>(null)
  const [active, setActive] = useState<string | null>("n1")
  const mouseRef = useRef({ x: -999, y: -999 })
  const animRef = useRef(0)
  const timeRef = useRef(0)

  const init = useCallback((w: number, h: number) => {
    nodesRef.current = NODES.map(n => ({ ...n, x: n.x * w, y: n.y * h, vx: 0, vy: 0 }))
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      const p = canvas.parentElement!
      const rect = p.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (nodesRef.current.length === 0) init(rect.width, rect.height)
    }
    resize()
    window.addEventListener("resize", resize)

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    canvas.addEventListener("mousemove", onMove)

    const draw = () => {
      timeRef.current += 0.012
      const t = timeRef.current
      const w = canvas.width / (window.devicePixelRatio || 1)
      const h = canvas.height / (window.devicePixelRatio || 1)
      ctx.clearRect(0, 0, w, h)

      // Faint grid
      ctx.strokeStyle = "rgba(255,255,255,0.012)"
      ctx.lineWidth = 1
      for (let x = 0; x < w; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke() }
      for (let y = 0; y < h; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke() }

      const nodes = nodesRef.current

      // Physics
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x
          const dy = nodes[j].y - nodes[i].y
          const d = Math.sqrt(dx * dx + dy * dy) || 1
          if (d < 90) {
            const f = (90 - d) * 0.002
            nodes[i].vx -= (dx / d) * f; nodes[i].vy -= (dy / d) * f
            nodes[j].vx += (dx / d) * f; nodes[j].vy += (dy / d) * f
          }
        }
        nodes[i].vx += Math.sin(t + i * 1.7) * 0.008
        nodes[i].vy += Math.cos(t * 0.6 + i * 2.3) * 0.008
        nodes[i].vx *= 0.97; nodes[i].vy *= 0.97
        nodes[i].x = Math.max(40, Math.min(w - 40, nodes[i].x + nodes[i].vx))
        nodes[i].y = Math.max(40, Math.min(h - 40, nodes[i].y + nodes[i].vy))
      }

      // Hover detection
      let hovId: string | null = null
      for (const n of nodes) {
        const dx = mouseRef.current.x - n.x, dy = mouseRef.current.y - n.y
        if (Math.sqrt(dx * dx + dy * dy) < n.radius + 8) { hovId = n.id; break }
      }

      // Edges
      const drawn = new Set<string>()
      for (const n of nodes) {
        for (const cid of n.connections) {
          const k = [n.id, cid].sort().join("-")
          if (drawn.has(k)) continue
          drawn.add(k)
          const tgt = nodes.find(nd => nd.id === cid)
          if (!tgt) continue
          const hi = active === n.id || active === cid || hovId === n.id || hovId === cid

          // Edge glow
          if (hi) {
            ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(tgt.x, tgt.y)
            ctx.strokeStyle = "rgba(0,240,255,0.04)"; ctx.lineWidth = 8; ctx.stroke()
          }

          ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(tgt.x, tgt.y)
          ctx.setLineDash(hi ? [5, 7] : [])
          ctx.lineDashOffset = hi ? -t * 40 : 0
          ctx.strokeStyle = hi ? "rgba(0,240,255,0.3)" : "rgba(255,255,255,0.03)"
          ctx.lineWidth = hi ? 1.5 : 0.8
          ctx.stroke()
          ctx.setLineDash([])
        }
      }

      // Nodes
      for (const n of nodes) {
        const c = TYPE_COLORS[n.type]
        const isA = active === n.id
        const isH = hovId === n.id
        const pulse = isA ? 1 + Math.sin(t * 3) * 0.1 : 1
        const r = n.radius * pulse

        // Active pulse ring
        if (isA) {
          const phase = (t * 1.2) % 1
          ctx.beginPath(); ctx.arc(n.x, n.y, r + 22 * phase, 0, Math.PI * 2)
          ctx.strokeStyle = c.fill.replace(")", `,${0.25 * (1 - phase)})`)
            .replace("rgb", "rgba").replace("#", "")
          ctx.strokeStyle = `rgba(0,240,255,${0.25 * (1 - phase)})`
          ctx.lineWidth = 1.5; ctx.stroke()
        }

        // Outer glow
        const g = ctx.createRadialGradient(n.x, n.y, r * 0.2, n.x, n.y, r * 2.8)
        g.addColorStop(0, isA ? c.glow : c.glow.replace("0.4", "0.08"))
        g.addColorStop(1, "transparent")
        ctx.beginPath(); ctx.arc(n.x, n.y, r * 2.8, 0, Math.PI * 2)
        ctx.fillStyle = g; ctx.fill()

        // Body
        ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
        const bg = ctx.createRadialGradient(n.x - r * 0.3, n.y - r * 0.3, 0, n.x, n.y, r)
        bg.addColorStop(0, isA || isH ? c.glow.replace("0.4", "0.18") : "rgba(14,14,16,0.9)")
        bg.addColorStop(1, "rgba(10,10,11,0.97)")
        ctx.fillStyle = bg; ctx.fill()
        ctx.strokeStyle = isA ? c.fill : isH ? c.fill + "90" : "rgba(255,255,255,0.04)"
        ctx.lineWidth = isA ? 2 : 1; ctx.stroke()

        // Center dot
        ctx.beginPath(); ctx.arc(n.x, n.y, 3.5, 0, Math.PI * 2)
        ctx.fillStyle = c.fill; ctx.globalAlpha = isA ? 1 : 0.5; ctx.fill(); ctx.globalAlpha = 1

        // Label
        ctx.font = `${isA || isH ? 600 : 400} 10px var(--font-mono, monospace)`
        ctx.textAlign = "center"
        ctx.fillStyle = isA || isH ? c.fill : "rgba(255,255,255,0.35)"
        ctx.fillText(n.label, n.x, n.y + r + 16)
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener("resize", resize)
      canvas.removeEventListener("mousemove", onMove)
    }
  }, [active, init])

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const nodes = nodesRef.current
    const rect = canvasRef.current!.getBoundingClientRect()
    const mx = e.clientX - rect.left, my = e.clientY - rect.top
    for (const n of nodes) {
      const dx = mx - n.x, dy = my - n.y
      if (Math.sqrt(dx * dx + dy * dy) < n.radius + 8) { setActive(n.id); return }
    }
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden glass-neon noise-overlay">
      <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" onClick={handleClick} />
      {/* Legend */}
      <div className="absolute top-3 left-3 flex gap-4 z-10">
        {Object.entries(TYPE_COLORS).map(([type, c]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: c.fill, boxShadow: `0 0 6px ${c.glow}` }} />
            <span className="text-[9px] font-mono uppercase tracking-widest text-white/30 capitalize">{type}</span>
          </div>
        ))}
      </div>
      {/* Active info chip */}
      {active && (() => {
        const n = NODES.find(nd => nd.id === active)!
        return (
          <div className="absolute bottom-3 left-3 z-10 glass rounded-lg px-3 py-2 border border-white/[0.04]">
            <p className="text-[9px] font-mono tracking-widest uppercase text-white/30">Selected</p>
            <p className="text-sm font-semibold mt-0.5" style={{ color: TYPE_COLORS[n.type].fill }}>{n.label}</p>
            <p className="text-[10px] text-white/30 font-mono capitalize">{n.type} &middot; {n.connections.length} links</p>
          </div>
        )
      })()}
    </div>
  )
}
