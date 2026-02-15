export function Footer() {
  return (
    <footer className="relative py-16 px-4">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative w-2.5 h-2.5">
            <div className="absolute inset-0 rounded-full bg-primary glow-cyan-sm" />
            <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
          </div>
          <span className="font-serif text-lg text-foreground glow-cyan-text">Night Archivist</span>
        </div>
        <p className="text-xs text-muted-foreground tracking-wide">
          HackNC State 2026 &middot; {"Siren's Call Track"}
        </p>
      </div>
    </footer>
  )
}
