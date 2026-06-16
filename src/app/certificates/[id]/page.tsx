import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getCertificateById } from "@/actions/certificates"
import { Button } from "@/components/ui/button"
import { Shield, ArrowLeft, CheckCircle2 } from "lucide-react"
import { CertificateDisplay } from "@/components/certificate-display"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cert = await getCertificateById(id)
  if (!cert) return { title: "Certificate Not Found - Edu Learn" }
  return {
    title: `${cert.course?.title} Certificate - Edu Learn`,
    description: `Verified certificate of completion for ${cert.course?.title} issued to ${cert.user?.name}`,
  }
}

export default async function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cert = await getCertificateById(id)

  if (!cert) {
    return (
      <div className="min-h-screen pt-16 sm:pt-20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Certificate Not Found</h1>
          <p className="text-muted-foreground">This certificate doesn&apos;t exist or has been revoked.</p>
          <Button asChild>
            <Link href="/certificates">Back to Certificates</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16 sm:pt-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/certificates" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Certificates
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            Print / Save PDF
          </Button>
        </div>

        <CertificateDisplay cert={cert} />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-muted/50 rounded-xl">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <span className="font-medium">Blockchain Verified</span>
          </div>
          <div className="flex-1 font-mono text-xs text-muted-foreground bg-background px-3 py-2 rounded-lg break-all">
            {cert.hash}
          </div>
          <Button variant="outline" size="sm" className="shrink-0" asChild>
            <Link href={`/verify?hash=${cert.hash}`}>
              <Shield className="h-4 w-4 mr-1" /> Verify
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
