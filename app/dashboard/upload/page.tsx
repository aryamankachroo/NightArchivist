import { EvidenceUploader } from "@/components/dashboard/evidence-uploader"

export default function UploadPage() {
  return (
    <div className="p-6 lg:p-10">
      <div className="mb-10">
        <p className="text-xs font-sans tracking-[0.4em] uppercase text-primary mb-2">Evidence</p>
        <h1 className="font-serif text-3xl md:text-4xl text-foreground glow-cyan-text">
          Upload Evidence
        </h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-lg leading-relaxed">
          Submit video footage, text logs, and audio recordings. The system will ingest, index, and analyze all evidence types automatically.
        </p>
      </div>
      <EvidenceUploader />
    </div>
  )
}
