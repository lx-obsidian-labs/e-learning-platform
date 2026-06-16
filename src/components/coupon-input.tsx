"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { validateCoupon } from "@/actions/coupons"
import { Tag, X, Check } from "lucide-react"
import { toast } from "sonner"

interface CouponData {
  id: string
  code: string
  discountType: "percentage" | "fixed"
  discountValue: number
}

export function CouponInput({
  onApply,
  onRemove,
  appliedCoupon,
}: {
  onApply: (coupon: CouponData) => void
  onRemove: () => void
  appliedCoupon: CouponData | null
}) {
  const [code, setCode] = useState("")
  const [validating, setValidating] = useState(false)

  async function handleApply() {
    if (!code.trim()) return
    setValidating(true)
    const result = await validateCoupon(code)
    setValidating(false)

    if (result.valid && result.coupon) {
      toast.success(`Coupon applied! ${result.coupon.discountType === "percentage" ? result.coupon.discountValue + "% off" : "R" + result.coupon.discountValue + " off"}`)
      onApply(result.coupon)
    } else {
      toast.error(result.error || "Invalid coupon")
    }
  }

  if (appliedCoupon) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
        <Tag className="h-4 w-4 text-emerald-600" />
        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
          {appliedCoupon.code}
        </span>
        <span className="text-xs text-emerald-600 dark:text-emerald-400">
          ({appliedCoupon.discountType === "percentage" ? `${appliedCoupon.discountValue}% off` : `R${appliedCoupon.discountValue} off`})
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 ml-auto text-emerald-600 hover:text-red-600"
          onClick={onRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Coupon code"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === "Enter" && handleApply()}
        className="h-9 text-sm"
      />
      <Button
        variant="outline"
        size="sm"
        className="h-9"
        onClick={handleApply}
        disabled={validating || !code.trim()}
      >
        {validating ? "..." : <Check className="h-4 w-4" />}
      </Button>
    </div>
  )
}
