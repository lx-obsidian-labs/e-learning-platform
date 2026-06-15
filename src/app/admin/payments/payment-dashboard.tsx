"use client"

import { useEffect, useState } from "react"
import { getPendingOrders, getCompletedOrders, approveOrder, rejectOrder } from "@/actions/payments"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Eye, ExternalLink } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type OrderWithProof = any

export function PaymentDashboard() {
  const [pending, setPending] = useState<OrderWithProof[]>([])
  const [completed, setCompleted] = useState<OrderWithProof[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"pending" | "history">("pending")
  const [preview, setPreview] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  async function load() {
    const [p, c] = await Promise.all([getPendingOrders(), getCompletedOrders()])
    setPending(p)
    setCompleted(c)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleApprove(orderId: string) {
    setActionLoading(orderId)
    await approveOrder(orderId)
    await load()
    setActionLoading(null)
  }

  async function handleReject(orderId: string) {
    if (!confirm("Reject this payment?")) return
    setActionLoading(orderId)
    await rejectOrder(orderId)
    await load()
    setActionLoading(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  const orders = tab === "pending" ? pending : completed

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setTab("pending")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            tab === "pending"
              ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Pending
          {pending.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px]">
              {pending.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("history")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            tab === "history"
              ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          History
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          {tab === "pending" ? "No pending payments" : "No payment history"}
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: OrderWithProof) => (
            <div
              key={order.id}
              className="rounded-xl border border-border/50 bg-card p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{order.users?.name || "Unknown"}</span>
                    <span className="text-sm text-muted-foreground">({order.users?.email})</span>
                    <Badge variant={order.status === "COMPLETED" ? "default" : order.status === "FAILED" ? "destructive" : "secondary"}>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground">
                    <span className="font-mono text-xs">{order.reference}</span>
                    <span>R{Number(order.amount).toFixed(2)}</span>
                    <span>{order.pricing_plans?.name || "N/A"}</span>
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>

                  {order.proofs?.length > 0 && (
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-muted-foreground">Proof:</span>
                      <button
                        onClick={() => setPreview(order.proofs[0].fileUrl)}
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <Eye className="h-3 w-3" />
                        View proof
                      </button>
                    </div>
                  )}
                </div>

                {tab === "pending" && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleApprove(order.id)}
                      disabled={actionLoading === order.id}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(order.id)}
                      disabled={actionLoading === order.id}
                      className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Proof of Payment</DialogTitle>
          </DialogHeader>
          {preview?.startsWith("data:image") ? (
            <img src={preview} alt="Proof of payment" className="w-full rounded-lg" />
          ) : preview?.startsWith("data:application/pdf") ? (
            <iframe src={preview} className="w-full h-[500px] rounded-lg" title="Proof of payment" />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ExternalLink className="h-8 w-8 mx-auto mb-2" />
              <p>Proof file cannot be previewed inline</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
