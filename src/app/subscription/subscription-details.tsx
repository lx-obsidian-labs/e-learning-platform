"use client"

import { useEffect, useState } from "react"
import { getUserSubscription, cancelSubscription, resumeSubscription, createBillingPortalSession } from "@/actions/subscriptions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Calendar, AlertCircle, ExternalLink, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

type Subscription = Awaited<ReturnType<typeof getUserSubscription>>

export function SubscriptionDetails() {
  const [sub, setSub] = useState<Subscription>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    getUserSubscription().then((d) => {
      setSub(d)
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

  if (!sub) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
          <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
          <p className="text-muted-foreground mb-6">You don't have an active subscription. Choose a plan to get started.</p>
          <Button asChild>
            <Link href="/pricing">View Plans</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const periodEnd = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : null
  const isCancelScheduled = sub.cancelAtPeriodEnd

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel your subscription? It will remain active until the end of the current billing period.")) return
    setActionLoading("cancel")
    const result = await cancelSubscription(sub.id)
    setActionLoading(null)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Subscription will be canceled at the end of the billing period")
      setSub({ ...sub, cancelAtPeriodEnd: true })
    }
  }

  async function handleResume() {
    setActionLoading("resume")
    const result = await resumeSubscription(sub.id)
    setActionLoading(null)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Subscription resumed")
      setSub({ ...sub, cancelAtPeriodEnd: false })
    }
  }

  async function handlePortal() {
    setActionLoading("portal")
    const url = await createBillingPortalSession()
    setActionLoading(null)
    if (url) {
      window.open(url, "_blank")
    } else {
      toast.error("Failed to open billing portal")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Subscription Details</span>
            <Badge variant={sub.status === "active" ? "default" : "secondary"}>
              {sub.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Plan</p>
              <p className="font-medium capitalize">{sub.planId.replace("plan_", "")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium capitalize">{sub.status}</p>
            </div>
            {periodEnd && (
              <div>
                <p className="text-sm text-muted-foreground">Current Period End</p>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {periodEnd.toLocaleDateString()}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Subscription ID</p>
              <p className="font-mono text-xs">{sub.stripeSubscriptionId}</p>
            </div>
          </div>

          {isCancelScheduled && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-300">Cancelation Scheduled</p>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Your subscription will be canceled at the end of the current billing period ({periodEnd?.toLocaleDateString()}).
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            {isCancelScheduled ? (
              <Button onClick={handleResume} disabled={actionLoading === "resume"} variant="default">
                {actionLoading === "resume" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Resume Subscription
              </Button>
            ) : (
              <Button onClick={handleCancel} disabled={actionLoading === "cancel"} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950">
                {actionLoading === "cancel" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Cancel Subscription
              </Button>
            )}
            <Button onClick={handlePortal} disabled={actionLoading === "portal"} variant="outline">
              {actionLoading === "portal" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ExternalLink className="h-4 w-4 mr-2" />}
              Manage Billing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
