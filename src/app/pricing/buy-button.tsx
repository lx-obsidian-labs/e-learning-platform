"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createOrder } from "@/actions/payments"
import { getStripePriceId } from "@/lib/pricing"
import { useState } from "react"
import { CreditCard } from "lucide-react"

export function BuyButton({
  planId,
  label,
  couponCode,
}: {
  planId: string
  label: string
  couponCode?: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [stripeLoading, setStripeLoading] = useState(false)

  const hasStripePrice = !!getStripePriceId(planId)

  async function handleBuy() {
    if (label === "Contact sales") {
      router.push("/contact")
      return
    }
    setLoading(true)
    const result = await createOrder(planId)
    if (result.error) {
      alert(result.error)
      setLoading(false)
      return
    }
    router.push(`/pricing/checkout/${result.orderId}`)
  }

  async function handleStripeCheckout() {
    setStripeLoading(true)
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, couponCode }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || "Failed to start checkout")
      }
    } catch {
      alert("Failed to connect to payment provider")
    }
    setStripeLoading(false)
  }

  return (
    <div className="space-y-2">
      <Button className="w-full h-11" onClick={handleBuy} disabled={loading || stripeLoading}>
        {loading ? "Creating order..." : label}
      </Button>
      {hasStripePrice && (
        <Button
          variant="outline"
          className="w-full h-11"
          onClick={handleStripeCheckout}
          disabled={stripeLoading || loading}
        >
          <CreditCard className="h-4 w-4 mr-2" />
          {stripeLoading ? "Redirecting..." : "Subscribe with Card"}
        </Button>
      )}
    </div>
  )
}
