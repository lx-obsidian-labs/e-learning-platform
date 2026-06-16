"use client"

import { Button } from "@/components/ui/button"
import { approveAffiliateCommission } from "@/actions/affiliates"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function ApproveButton({ referralId }: { referralId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleApprove() {
    setLoading(true)
    const result = await approveAffiliateCommission(referralId)
    if (result.success) {
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="text-emerald-600"
      onClick={handleApprove}
      disabled={loading}
    >
      {loading ? "Approving..." : "Approve"}
    </Button>
  )
}
