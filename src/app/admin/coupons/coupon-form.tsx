"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createCoupon } from "@/actions/coupons"
import { Plus } from "lucide-react"
import { toast } from "sonner"

export function CouponForm() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)

    const result = await createCoupon({
      code: form.get("code") as string,
      discountType,
      discountValue: Number(form.get("discountValue")),
      maxUses: form.get("maxUses") ? Number(form.get("maxUses")) : undefined,
      minAmount: form.get("minAmount") ? Number(form.get("minAmount")) : undefined,
      expiresAt: form.get("expiresAt") as string || undefined,
    })

    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Coupon created")
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Coupon
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Coupon</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Coupon Code</Label>
            <Input id="code" name="code" placeholder="SUMMER2024" required />
          </div>

          <div className="space-y-2">
            <Label>Discount Type</Label>
            <Select value={discountType} onValueChange={(v: "percentage" | "fixed") => setDiscountType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage (%)</SelectItem>
                <SelectItem value="fixed">Fixed Amount (R)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discountValue">
              {discountType === "percentage" ? "Discount Percentage" : "Discount Amount (R)"}
            </Label>
            <Input
              id="discountValue"
              name="discountValue"
              type="number"
              step="0.01"
              min="0"
              placeholder={discountType === "percentage" ? "10" : "50"}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxUses">Max Uses (optional)</Label>
              <Input id="maxUses" name="maxUses" type="number" min="1" placeholder="100" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minAmount">Min Amount (optional)</Label>
              <Input id="minAmount" name="minAmount" type="number" step="0.01" min="0" placeholder="50" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expiry Date (optional)</Label>
            <Input id="expiresAt" name="expiresAt" type="date" />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Coupon"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
