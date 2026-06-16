import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getAllCertificates, revokeCertificate } from "@/actions/certificates"
import { Shield, Search, ExternalLink } from "lucide-react"

export const dynamic = "force-dynamic"

type Props = {
  searchParams: Promise<{ page?: string; search?: string }>
}

export default async function AdminCertificatesPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const params = await searchParams
  const page = parseInt(params.page || "1", 10)
  const search = params.search

  const { certificates, total, page: currentPage, limit } = await getAllCertificates({
    page,
    search,
  }) as { certificates: Record<string, unknown>[]; total: number; page: number; limit: number }

  const totalPages = Math.ceil(total / limit)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Certificate Management</h1>
        <p className="lead">View, issue, and revoke certificates</p>
      </div>

      <Card variant="pro" className="mb-6">
        <CardContent className="pt-6">
          <form className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="search"
                placeholder="Search by student name or course..."
                defaultValue={search || ""}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="secondary">Search</Button>
            {search && (
              <Button asChild variant="ghost">
                <Link href="/admin/certificates">Clear</Link>
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      <Card variant="pro">
        <CardContent className="p-0">
          {certificates.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              {search ? "No certificates match your search." : "No certificates issued yet."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium">Student</th>
                    <th className="text-left px-4 py-3 font-medium">Course</th>
                    <th className="text-left px-4 py-3 font-medium">Issued</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-right px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((cert: Record<string, unknown>) => (
                    <tr key={cert.id as string} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{(cert.user as Record<string, unknown>)?.name as string || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{(cert.user as Record<string, unknown>)?.email as string || ""}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{(cert.course as Record<string, unknown>)?.title as string || "Unknown"}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(cert.issuedAt as string).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        {cert.revokedAt ? (
                          <Badge variant="destructive">Revoked</Badge>
                        ) : (
                          <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Active</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/certificates/${cert.id as string}`}>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                          {!cert.revokedAt && (
                            <form
                              action={async () => {
                                "use server"
                                await revokeCertificate(cert.id as string, "Revoked by admin")
                              }}
                            >
                              <Button variant="outline" size="sm" type="submit" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                                Revoke
                              </Button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {currentPage > 1 && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/certificates?page=${currentPage - 1}${search ? `&search=${search}` : ""}`}>
                Previous
              </Link>
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/certificates?page=${currentPage + 1}${search ? `&search=${search}` : ""}`}>
                Next
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
