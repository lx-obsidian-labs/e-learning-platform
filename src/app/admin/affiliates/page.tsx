import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { getAdminAffiliates } from "@/actions/affiliates"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, DollarSign, Gift } from "lucide-react"
import { ApproveButton } from "./approve-button"

export const dynamic = "force-dynamic"

export default async function AdminAffiliatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const admin = createAdminClient()
  const { data: profile } = await admin.from("users").select("role").eq('"id"', user.id).single()
  if (profile?.role !== "ADMIN") redirect("/dashboard")

  const affiliates = await getAdminAffiliates()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Affiliate Management</h1>
        <p className="text-muted-foreground mt-1">Manage affiliates and approve commissions</p>
      </div>

      {affiliates.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Gift className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>No affiliates yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {affiliates.map((affiliate: any) => (
            <Card key={affiliate.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{affiliate.users?.name || "Unknown"}</CardTitle>
                    <p className="text-sm text-muted-foreground">{affiliate.users?.email}</p>
                  </div>
                  <Badge variant={affiliate.active ? "default" : "secondary"}>
                    {affiliate.active ? "Active" : "Disabled"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 mb-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Code: <code className="font-mono font-medium">{affiliate.referralCode}</code>
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    Total Earned: <strong>R{Number(affiliate.totalEarned).toFixed(2)}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-amber-500" />
                    Withdrawn: <strong>R{Number(affiliate.totalWithdrawn).toFixed(2)}</strong>
                  </span>
                </div>

                <AffiliateReferrals affiliateId={affiliate.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

async function AffiliateReferrals({ affiliateId }: { affiliateId: string }) {
  const admin = createAdminClient()
  const { data: referrals } = await admin
    .from("affiliate_referrals")
    .select("*, referredUser:referredUserId(name, email)")
    .eq('"affiliateId"', affiliateId)
    .order('"createdAt"', { ascending: false })

  if (!referrals || referrals.length === 0) {
    return <p className="text-sm text-muted-foreground">No referrals yet</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-2 font-medium">Referred User</th>
            <th className="pb-2 font-medium">Date</th>
            <th className="pb-2 font-medium">Commission</th>
            <th className="pb-2 font-medium">Status</th>
            <th className="pb-2 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {referrals.map((ref: any) => (
            <tr key={ref.id} className="border-b last:border-0">
              <td className="py-2">{ref.referredUser?.name || ref.referredUserId || "Unknown"}</td>
              <td className="py-2">{new Date(ref.createdAt).toLocaleDateString()}</td>
              <td className="py-2 font-medium">R{Number(ref.commission).toFixed(2)}</td>
              <td className="py-2">
                <Badge variant={ref.status === "approved" ? "default" : ref.status === "pending" ? "secondary" : "outline"}>
                  {ref.status}
                </Badge>
              </td>
              <td className="py-2">
                {ref.status === "pending" && <ApproveButton referralId={ref.id} />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
