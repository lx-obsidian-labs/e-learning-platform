import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { CouponForm } from "./coupon-form"
import { getCoupons } from "@/actions/coupons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tag, Calendar, Users, Percent, DollarSign } from "lucide-react"
import { deleteCoupon } from "@/actions/coupons"

export const dynamic = "force-dynamic"

export default async function AdminCouponsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const admin = createAdminClient()
  const { data: profile } = await admin.from("users").select("role").eq('"id"', user.id).single()
  if (profile?.role !== "ADMIN") redirect("/dashboard")

  const coupons = await getCoupons()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Coupon Codes</h1>
          <p className="text-muted-foreground mt-1">Manage discount coupons and promotions</p>
        </div>
        <CouponForm />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          {coupons.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Tag className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p>No coupons created yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Code</th>
                    <th className="pb-3 font-medium">Discount</th>
                    <th className="pb-3 font-medium">Uses</th>
                    <th className="pb-3 font-medium">Min Amount</th>
                    <th className="pb-3 font-medium">Expires</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon: any) => (
                    <tr key={coupon.id} className="border-b last:border-0">
                      <td className="py-3 font-mono font-medium">{coupon.code}</td>
                      <td className="py-3">
                        {coupon.discountType === "percentage" ? (
                          <span className="flex items-center gap-1"><Percent className="h-3 w-3" />{Number(coupon.discountValue)}%</span>
                        ) : (
                          <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{Number(coupon.discountValue).toFixed(2)}</span>
                        )}
                      </td>
                      <td className="py-3">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {coupon.currentUses}{coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
                        </span>
                      </td>
                      <td className="py-3">
                        {coupon.minAmount ? `R${Number(coupon.minAmount).toFixed(2)}` : "—"}
                      </td>
                      <td className="py-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : "Never"}
                        </span>
                      </td>
                      <td className="py-3">
                        <Badge variant={coupon.active ? "default" : "secondary"}>
                          {coupon.active ? "Active" : "Disabled"}
                        </Badge>
                      </td>
                      <td className="py-3">
                        {coupon.active && (
                          <form action={deleteCoupon.bind(null, coupon.id)}>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                              Disable
                            </Button>
                          </form>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
