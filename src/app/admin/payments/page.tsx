import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PaymentDashboard } from "./payment-dashboard"

export const dynamic = "force-dynamic"

export default async function AdminPaymentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Payment Verification</h1>
        <p className="text-muted-foreground mt-1">Review and approve EFT payments</p>
      </div>
      <PaymentDashboard />
    </div>
  )
}
