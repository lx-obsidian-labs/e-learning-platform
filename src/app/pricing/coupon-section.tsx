"use client"

import { useState } from "react"
import { CouponInput } from "@/components/coupon-input"
import { BuyButton } from "./buy-button"

interface CouponData {
  id: string
  code: string
  discountType: "percentage" | "fixed"
  discountValue: number
}

export function CouponSection({ planId }: { planId: string }) {
  const [coupon, setCoupon] = useState<CouponData | null>(null)

  return (
    <div className="mt-3 space-y-2">
      <CouponInput
        onApply={(c) => setCoupon(c)}
        onRemove={() => setCoupon(null)}
        appliedCoupon={coupon}
      />
      {coupon && (
        <BuyButton planId={planId} label="Pay by EFT" couponCode={coupon.code} />
      )}
    </div>
  )
}
