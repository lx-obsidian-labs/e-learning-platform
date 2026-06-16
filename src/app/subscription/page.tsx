import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SubscriptionDetails } from "./subscription-details"
import { getUserOrders } from "@/actions/payments"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

export default async function SubscriptionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const orders = await getUserOrders()

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
          <p className="text-muted-foreground mt-1">Manage your subscription and billing</p>
        </div>

        <SubscriptionDetails />

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No payments yet</p>
            ) : (
              <div className="space-y-2">
                {orders.slice(0, 10).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0 text-sm">
                    <div>
                      <span className="font-medium">{order.pricing_plans?.name || "Plan"}</span>
                      <span className="text-muted-foreground ml-2">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>R{Number(order.amount).toFixed(2)}</span>
                      <Badge variant={order.status === "COMPLETED" ? "default" : order.status === "FAILED" ? "destructive" : "secondary"}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
