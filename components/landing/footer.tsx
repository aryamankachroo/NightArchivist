export function Footer() {
  return (
    <footer className="relative py-12 px-4">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="font-serif text-lg text-foreground">Night Archivist</span>
        </div>
        <p className="text-xs text-muted-foreground">
          HackNC State 2026 &middot; {"Siren's Call Track"}
        </p>
      </div>
    </footer>
  )
}
