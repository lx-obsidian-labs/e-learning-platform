import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getMyCertificates } from "@/actions/certificates"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Award, ExternalLink, Shield } from "lucide-react"

export const dynamic = "force-dynamic"
export const metadata = { title: "My Certificates - Edu Learn" }

export default async function CertificatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const certificates = await getMyCertificates()

  return (
    <div className="min-h-screen pt-16 sm:pt-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Certificates</h1>
          <p className="text-muted-foreground mt-1">
            Blockchain-verified credentials for completed courses
          </p>
        </div>

        {certificates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-16">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Award className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg text-muted-foreground">No certificates yet</p>
              <p className="text-sm text-muted-foreground">Complete a course to earn your first certificate</p>
              <Button asChild className="btn-premium">
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {certificates.map((cert: any) => (
              <Card key={cert.id} className="pro-card card-glow overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-indigo-500" />
                        <h3 className="text-lg font-semibold">{cert.course?.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Issued to {cert.user?.name || "You"} on{" "}
                        {new Date(cert.issuedAt).toLocaleDateString("en-US", {
                          year: "numeric", month: "long", day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        <Shield className="h-3 w-3 text-emerald-500" />
                        Verified
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/certificates/${cert.id}`}>
                          View <ExternalLink className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground font-mono">
                    <span className="truncate max-w-[300px]">Hash: {cert.hash}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
