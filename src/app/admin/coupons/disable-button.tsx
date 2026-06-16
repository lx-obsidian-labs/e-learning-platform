"use client"

import { Button } from "@/components/ui/button"
import { deleteCoupon } from "@/actions/coupons"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function DisableButton({ couponId }: { couponId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDisable() {
    setLoading(true)
    const result = await deleteCoupon(couponId)
    if (result.success) {
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-red-500 hover:text-red-700"
      onClick={handleDisable}
      disabled={loading}
    >
      {loading ? "Disabling..." : "Disable"}
    </Button>
  )
}
