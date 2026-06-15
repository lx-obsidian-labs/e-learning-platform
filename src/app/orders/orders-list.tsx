"use client"

import { useEffect, useState } from "react"
import { getUserOrders } from "@/actions/payments"
import { Badge } from "@/components/ui/badge"
import { Receipt, Clock, CheckCircle, XCircle, ExternalLink } from "lucide-react"
import Link from "next/link"

type OrderWithPlan = Awaited<ReturnType<typeof getUserOrders>>[number]

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
  PENDING: { label: "Pending", variant: "secondary", icon: Clock },
  COMPLETED: { label: "Approved", variant: "default", icon: CheckCircle },
  FAILED: { label: "Rejected", variant: "destructive", icon: XCircle },
}

export function OrdersList() {
  const [orders, setOrders] = useState<OrderWithPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUserOrders().then((data) => {
      setOrders(data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Receipt className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground">No orders yet</h3>
        <p className="text-sm text-muted-foreground/60 mt-1">
          Visit the{" "}
          <Link href="/pricing" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            pricing page
          </Link>{" "}
          to purchase a plan.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {orders.map((order: any) => {
        const cfg = statusConfig[order.status] || statusConfig.PENDING
        const Icon = cfg.icon

        return (
          <div
            key={order.id}
            className="rounded-xl border border-border/50 bg-card p-5 hover:border-border transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{order.pricing_plans?.name || "Plan"}</span>
                  <Badge variant={cfg.variant}>
                    <Icon className="h-3 w-3 mr-1" />
                    {cfg.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground flex-wrap">
                  <span className="font-mono text-xs">{order.reference}</span>
                  <span>R{Number(order.amount).toFixed(2)}</span>
                  <span>{order.paymentMethod}</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              {order.status === "PENDING" && (
                <Link
                  href={`/pricing/checkout/${order.id}`}
                  className="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
                >
                  Complete payment
                  <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
