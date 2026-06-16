import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PaymentDashboard } from "./payment-dashboard"
import { Card, CardContent } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function AdminPaymentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Payment Verification</h1>
        <p className="lead">Review and approve EFT payments</p>
      </div>
      <Card variant="pro">
        <CardContent className="p-0">
          <PaymentDashboard />
        </CardContent>
      </Card>
    </div>
  )
}
