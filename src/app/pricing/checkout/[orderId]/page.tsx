import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { getPaymentConfig } from "@/lib/env"
import { CheckoutForm } from "./checkout-form"

export const dynamic = "force-dynamic"

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const admin = createAdminClient()

  const { data: order } = await admin
    .from("orders")
    .select("*, pricing_plans(*)")
    .eq('"id"', orderId)
    .single()

  if (!order || order.userId !== user.id) redirect("/pricing")

  const bank = getPaymentConfig()

  const { data: existingProof } = await admin
    .from("payment_proofs")
    .select('"id"')
    .eq('"orderId"', orderId)
    .maybeSingle()

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Complete your payment</h1>
          <p className="text-muted-foreground mt-1">Pay via EFT and upload your proof of payment</p>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b">
            <span className="text-sm text-muted-foreground">Plan</span>
            <span className="font-semibold">{order.pricing_plans?.name || "N/A"}</span>
          </div>
          <div className="flex items-center justify-between pb-4 border-b">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="font-semibold text-lg">R{Number(order.amount).toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between pb-4 border-b">
            <span className="text-sm text-muted-foreground">Reference</span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{order.reference}</span>
          </div>
          <div className="flex items-center justify-between pb-4 border-b">
            <span className="text-sm text-muted-foreground">Status</span>
            <span className={`text-sm font-medium ${order.status === "PENDING" ? "text-amber-600" : "text-emerald-600"}`}>
              {order.status === "PENDING" ? "Awaiting payment" : order.status}
            </span>
          </div>

          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Banking Details</p>
            <div className="text-sm space-y-1">
              <p><span className="text-muted-foreground">Bank:</span> {bank.bankName}</p>
              <p><span className="text-muted-foreground">Account Name:</span> {bank.accountName}</p>
              <p><span className="text-muted-foreground">Account Number:</span> {bank.accountNumber}</p>
              <p><span className="text-muted-foreground">Branch Code:</span> {bank.branchCode}</p>
            </div>
            <div className="mt-3 pt-3 border-t border-border/40">
              <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">Important</p>
              <p className="text-xs text-muted-foreground mt-1">
                Use the reference number above as your EFT payment reference. This helps us match your payment.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <CheckoutForm orderId={orderId} hasProof={!!existingProof?.id} />
        </div>
      </div>
    </div>
  )
}
