"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createOrder } from "@/actions/payments"
import { useState } from "react"

export function BuyButton({ planId, label }: { planId: string; label: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

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

  return (
    <Button className="w-full h-11" onClick={handleBuy} disabled={loading}>
      {loading ? "Creating order..." : label}
    </Button>
  )
}
