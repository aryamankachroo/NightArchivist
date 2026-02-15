import { EvidenceUploader } from "@/components/dashboard/evidence-uploader"

export default function UploadPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <p className="text-xs font-sans tracking-[0.3em] uppercase text-primary mb-2">Evidence</p>
        <h1 className="font-serif text-3xl md:text-4xl text-foreground">Upload Evidence</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-lg">
          Submit video footage, text logs, and audio recordings. The system will ingest, index, and analyze all evidence types automatically.
        </p>
      </div>
      <EvidenceUploader />
    </div>
  )
}
