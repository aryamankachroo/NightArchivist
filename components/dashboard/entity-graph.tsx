"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, MapPin, Package, Zap, Info } from "lucide-react"

type EntityType = "person" | "location" | "object" | "event"

type Entity = {
  id: string
  name: string
  type: EntityType
  mentions: number
  x: number
  y: number
}

type Connection = {
  from: string
  to: string
  strength: number
  label: string
}

const entities: Entity[] = [
  { id: "e1", name: "Subject A", type: "person", mentions: 4, x: 400, y: 120 },
  { id: "e2", name: "Subject B", type: "person", mentions: 1, x: 180, y: 280 },
  { id: "e3", name: "East Entrance", type: "location", mentions: 1, x: 620, y: 200 },
  { id: "e4", name: "Third Floor", type: "location", mentions: 2, x: 280, y: 400 },
  { id: "e5", name: "Server Room", type: "location", mentions: 1, x: 520, y: 350 },
  { id: "e6", name: "Briefcase", type: "object", mentions: 2, x: 600, y: 80 },
  { id: "e7", name: "South Stairwell", type: "location", mentions: 1, x: 150, y: 140 },
  { id: "e8", name: "Power Grid", type: "event", mentions: 1, x: 400, y: 450 },
]

const connections: Connection[] = [
  { from: "e1", to: "e3", strength: 3, label: "entered via" },
  { from: "e1", to: "e6", strength: 2, label: "carried" },
  { from: "e1", to: "e2", strength: 1, label: "spoke with" },
  { from: "e1", to: "e7", strength: 1, label: "exited via" },
  { from: "e2", to: "e4", strength: 1, label: "mentioned" },
  { from: "e4", to: "e8", strength: 2, label: "location of" },
  { from: "e5", to: "e4", strength: 1, label: "located on" },
  { from: "e1", to: "e5", strength: 1, label: "attempted access" },
]

const typeStyles: Record<EntityType, { color: string; bg: string; icon: typeof User }> = {
  person: { color: "#c9a54e", bg: "rgba(201,165,78,0.15)", icon: User },
  location: { color: "#4ea5c9", bg: "rgba(78,165,201,0.15)", icon: MapPin },
  object: { color: "#a5c94e", bg: "rgba(165,201,78,0.15)", icon: Package },
  event: { color: "#c94e4e", bg: "rgba(201,78,78,0.15)", icon: Zap },
}

const typeBadgeColors: Record<EntityType, string> = {
  person: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  location: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  object: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  event: "bg-red-500/10 text-red-400 border-red-500/20",
}

export function EntityGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null)
  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Clear
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Scale entities to fit canvas
    const scaleX = rect.width / 780
    const scaleY = rect.height / 520

    // Draw connections
    connections.forEach((conn) => {
      const from = entities.find((e) => e.id === conn.from)
      const to = entities.find((e) => e.id === conn.to)
      if (!from || !to) return

      const fx = from.x * scaleX
      const fy = from.y * scaleY
      const tx = to.x * scaleX
      const ty = to.y * scaleY

      const isHighlighted =
        hoveredEntity === conn.from || hoveredEntity === conn.to

      ctx.beginPath()
      ctx.moveTo(fx, fy)
      ctx.lineTo(tx, ty)
      ctx.strokeStyle = isHighlighted
        ? "rgba(201,165,78,0.5)"
        : "rgba(255,255,255,0.06)"
      ctx.lineWidth = Math.max(1, conn.strength * (isHighlighted ? 1.5 : 0.8))
      ctx.stroke()

      // Label
      if (isHighlighted) {
        const mx = (fx + tx) / 2
        const my = (fy + ty) / 2
        ctx.font = "10px system-ui"
        ctx.fillStyle = "rgba(201,165,78,0.7)"
        ctx.textAlign = "center"
        ctx.fillText(conn.label, mx, my - 6)
      }
    })

    // Draw entities
    entities.forEach((entity) => {
      const ex = entity.x * scaleX
      const ey = entity.y * scaleY
      const style = typeStyles[entity.type]
      const isHovered = hoveredEntity === entity.id
      const radius = 20 + entity.mentions * 3

      // Glow
      if (isHovered) {
        const gradient = ctx.createRadialGradient(ex, ey, 0, ex, ey, radius * 2)
        gradient.addColorStop(0, style.bg)
        gradient.addColorStop(1, "transparent")
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(ex, ey, radius * 2, 0, Math.PI * 2)
        ctx.fill()
      }

      // Node circle
      ctx.beginPath()
      ctx.arc(ex, ey, radius, 0, Math.PI * 2)
      ctx.fillStyle = isHovered ? style.bg : "rgba(15,17,23,0.8)"
      ctx.fill()
      ctx.strokeStyle = isHovered ? style.color : "rgba(255,255,255,0.1)"
      ctx.lineWidth = isHovered ? 2 : 1
      ctx.stroke()

      // Label
      ctx.font = `${isHovered ? "bold " : ""}11px system-ui`
      ctx.fillStyle = isHovered ? style.color : "rgba(255,255,255,0.6)"
      ctx.textAlign = "center"
      ctx.fillText(entity.name, ex, ey + radius + 16)
    })
  }, [hoveredEntity])

  const handleCanvasHover = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const scaleX = rect.width / 780
    const scaleY = rect.height / 520

    let found: string | null = null
    for (const entity of entities) {
      const ex = entity.x * scaleX
      const ey = entity.y * scaleY
      const radius = 20 + entity.mentions * 3
      const dist = Math.sqrt((mx - ex) ** 2 + (my - ey) ** 2)
      if (dist < radius + 10) {
        found = entity.id
        break
      }
    }
    setHoveredEntity(found)
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const scaleX = rect.width / 780
    const scaleY = rect.height / 520

    for (const entity of entities) {
      const ex = entity.x * scaleX
      const ey = entity.y * scaleY
      const radius = 20 + entity.mentions * 3
      const dist = Math.sqrt((mx - ex) ** 2 + (my - ey) ** 2)
      if (dist < radius + 10) {
        setSelectedEntity(entity)
        return
      }
    }
    setSelectedEntity(null)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Graph canvas */}
      <Card className="lg:col-span-2 bg-card border-border overflow-hidden">
        <CardContent className="p-0">
          <canvas
            ref={canvasRef}
            className="w-full h-[480px] cursor-crosshair"
            onMouseMove={handleCanvasHover}
            onClick={handleCanvasClick}
          />
        </CardContent>
      </Card>

      {/* Entity details panel */}
      <div className="flex flex-col gap-4">
        {/* Legend */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-sans font-semibold text-foreground">Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {(Object.entries(typeStyles) as [EntityType, typeof typeStyles.person][]).map(
                ([type, style]) => (
                  <div key={type} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: style.color }}
                    />
                    <span className="text-xs font-sans capitalize text-muted-foreground">
                      {type}
                    </span>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Selected entity info */}
        <Card className="bg-card border-border flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-sans font-semibold text-foreground flex items-center gap-2">
              <Info className="w-4 h-4 text-muted-foreground" />
              Entity Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedEntity ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = typeStyles[selectedEntity.type].icon
                    return (
                      <div
                        className="flex items-center justify-center w-10 h-10 rounded-lg"
                        style={{ backgroundColor: typeStyles[selectedEntity.type].bg }}
                      >
                        <Icon
                          className="w-5 h-5"
                          style={{ color: typeStyles[selectedEntity.type].color }}
                        />
                      </div>
                    )
                  })()}
                  <div>
                    <p className="text-sm font-sans font-semibold text-foreground">
                      {selectedEntity.name}
                    </p>
                    <Badge variant="outline" className={typeBadgeColors[selectedEntity.type]}>
                      {selectedEntity.type}
                    </Badge>
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">
                    Mentioned {selectedEntity.mentions} time{selectedEntity.mentions !== 1 ? "s" : ""} across evidence
                  </p>
                  <p className="text-[10px] font-sans tracking-[0.15em] uppercase text-muted-foreground mb-1">
                    Connections
                  </p>
                  <ul className="flex flex-col gap-1">
                    {connections
                      .filter(
                        (c) =>
                          c.from === selectedEntity.id || c.to === selectedEntity.id
                      )
                      .map((c, i) => {
                        const otherId =
                          c.from === selectedEntity.id ? c.to : c.from
                        const other = entities.find((e) => e.id === otherId)
                        return (
                          <li key={i} className="text-xs text-muted-foreground">
                            <span className="text-foreground">{c.label}</span>{" "}
                            {other?.name}
                          </li>
                        )
                      })}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Click on an entity node in the graph to view its details and connections.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
