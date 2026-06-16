import { verifyCertificateByHash } from "@/actions/certificates"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Shield, Ban } from "lucide-react"
import { VerificationForm } from "@/components/verification-form"

export const dynamic = "force-dynamic"
export const metadata = { title: "Verify Certificate - Edu Learn" }

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ hash?: string }>
}) {
  const { hash } = await searchParams
  let result = null
  if (hash) {
    result = await verifyCertificateByHash(hash)
  }

  return (
    <div className="min-h-screen pt-16 sm:pt-20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Verify a Certificate</h1>
          <p className="text-muted-foreground mt-1">
            Check the authenticity of an Edu Learn certificate by entering its hash
          </p>
        </div>

        <VerificationForm initialHash={hash || ""} />

        {hash && result === null && (
          <Card className="border-red-200 dark:border-red-900">
            <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="h-14 w-14 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                <XCircle className="h-7 w-7 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Invalid Certificate</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  No valid certificate found with this hash. The certificate may have been altered or does not exist.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card className={`border ${
            result.valid && !result.certificate.revokedAt
              ? "border-emerald-200 dark:border-emerald-900"
              : "border-red-200 dark:border-red-900"
          }`}>
            <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
              {result.valid && !result.certificate.revokedAt ? (
                <>
                  <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                    <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                      Certificate Verified ✓
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      This certificate was issued to {result.certificate.studentName} for completing &ldquo;{result.certificate.courseTitle}&rdquo;.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    <Shield className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Blockchain-verified credential</span>
                  </div>
                  {result.certificate.issuedAt && (
                    <p className="text-xs text-muted-foreground">
                      Issued on {new Date(result.certificate.issuedAt).toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric",
                      })}
                    </p>
                  )}
                </>
              ) : result.valid && result.certificate.revokedAt ? (
                <>
                  <div className="h-14 w-14 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                    <Ban className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                      Certificate Revoked
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      This certificate for <strong>{result.certificate.courseTitle}</strong> issued to {result.certificate.studentName} was revoked on{" "}
                      {new Date(result.certificate.revokedAt).toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric",
                      })}.
                    </p>
                    <Badge variant="destructive" className="mt-2">Revoked</Badge>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-14 w-14 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                    <XCircle className="h-7 w-7 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Invalid Certificate</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      No valid certificate found with this hash. The certificate may have been altered or does not exist.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
