"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, FileVideo, FileText, Mic, X, CheckCircle, Loader2 } from "lucide-react"

type EvidenceFile = {
  id: string
  name: string
  type: "video" | "text" | "audio"
  size: string
  status: "queued" | "uploading" | "processing" | "complete"
}

const typeIcons = { video: FileVideo, text: FileText, audio: Mic }

const typeColors = {
  video: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  text: "bg-primary/10 text-primary border-primary/20",
  audio: "bg-amber-500/10 text-amber-400 border-amber-500/20",
}

function getFileType(name: string): "video" | "text" | "audio" {
  const ext = name.split(".").pop()?.toLowerCase() || ""
  if (["mp4", "avi", "mov", "webm", "mkv"].includes(ext)) return "video"
  if (["wav", "mp3", "ogg", "flac", "aac"].includes(ext)) return "audio"
  return "text"
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

export function EvidenceUploader() {
  const [files, setFiles] = useState<EvidenceFile[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const addFiles = useCallback((fileList: FileList) => {
    const newFiles: EvidenceFile[] = Array.from(fileList).map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      type: getFileType(f.name),
      size: formatSize(f.size),
      status: "queued" as const,
    }))
    setFiles((prev) => [...prev, ...newFiles])
  }, [])

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const simulateUpload = () => {
    setFiles((prev) =>
      prev.map((f) => (f.status === "queued" ? { ...f, status: "uploading" as const } : f))
    )
    files.forEach((file, i) => {
      if (file.status !== "queued") return
      setTimeout(() => {
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: "processing" } : f))
        )
      }, 1000 + i * 800)
      setTimeout(() => {
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: "complete" } : f))
        )
      }, 2500 + i * 800)
    })
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
    },
    [addFiles]
  )

  const hasQueued = files.some((f) => f.status === "queued")

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Drop zone */}
      <div
        className={`relative rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer group overflow-hidden ${
          isDragging
            ? "border-primary bg-primary/[0.03] scale-[1.01]"
            : "border-border/40 glass-panel hover:border-primary/20"
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        {isDragging && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-primary/10 blur-[100px] animate-glow-pulse" />
          </div>
        )}

        <div className="relative flex flex-col items-center justify-center py-20">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl glass-inset mb-6 group-hover:glow-cyan-sm transition-all duration-500 group-hover:scale-110">
            <Upload className="w-7 h-7 text-primary" />
          </div>
          <p className="text-sm font-sans font-medium text-foreground mb-1.5">
            Drop evidence files here or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Supports video (MP4, AVI), text (TXT, PDF, LOG), and audio (WAV, MP3)
          </p>
        </div>
      </div>

      <input
        id="file-input"
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files)
        }}
      />

      {/* File type badges */}
      <div className="flex flex-wrap gap-3">
        {[
          { icon: FileVideo, label: "Video", exts: "MP4, AVI, MOV" },
          { icon: FileText, label: "Text", exts: "TXT, PDF, LOG" },
          { icon: Mic, label: "Audio", exts: "WAV, MP3, OGG" },
        ].map((t) => (
          <div
            key={t.label}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg glass-inset hover:border-primary/15 transition-colors"
          >
            <t.icon className="w-3.5 h-3.5 text-primary/60" />
            <span className="text-xs text-muted-foreground">
              <span className="text-foreground font-medium">{t.label}</span> &middot; {t.exts}
            </span>
          </div>
        ))}
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-sans font-medium text-foreground">
              {files.length} file{files.length !== 1 ? "s" : ""} selected
            </p>
            {hasQueued && (
              <Button size="sm" onClick={simulateUpload} className="gap-2 glow-cyan-sm">
                <Upload className="w-3 h-3" />
                Process All
              </Button>
            )}
          </div>

          {files.map((file) => {
            const Icon = typeIcons[file.type]
            return (
              <div
                key={file.id}
                className="flex items-center gap-4 p-4 rounded-lg glass-panel hover:border-primary/15 transition-all group"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg glass-inset group-hover:glow-cyan-sm transition-all duration-500">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-sans font-medium text-foreground truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{file.size}</p>
                </div>
                <Badge variant="outline" className={typeColors[file.type]}>
                  {file.type}
                </Badge>
                {file.status === "queued" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(file.id) }}
                    className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary/50"
                    aria-label="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {file.status === "uploading" && (
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                )}
                {file.status === "processing" && (
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                )}
                {file.status === "complete" && (
                  <CheckCircle className="w-4 h-4 text-primary drop-shadow-[0_0_8px_hsla(170,100%,45%,0.5)]" />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
