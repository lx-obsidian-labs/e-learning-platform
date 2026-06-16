"use client"

import { useEffect, useState } from "react"
import { getAffiliateStats } from "@/actions/affiliates"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Check, Users, DollarSign, Clock, Gift } from "lucide-react"
import { toast } from "sonner"

type AffiliateData = Awaited<ReturnType<typeof getAffiliateStats>>

export function AffiliateDashboard() {
  const [data, setData] = useState<AffiliateData>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    getAffiliateStats().then((d) => {
      setData(d)
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

  if (!data) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Gift className="h-12 w-12 mx-auto mb-3 opacity-40" />
        <p>Could not load affiliate data</p>
      </div>
    )
  }

  const referralLink = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}?ref=${data.referralCode}`

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      toast.success("Referral link copied!")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl border p-6 sm:p-8">
        <h2 className="text-lg font-semibold mb-3">Your Referral Code</h2>
        <div className="flex items-center gap-3 mb-4">
          <code className="text-2xl font-bold tracking-wider bg-background px-4 py-2 rounded-lg border">
            {data.referralCode}
          </code>
        </div>
        <div className="flex items-center gap-2">
          <Input value={referralLink} readOnly className="font-mono text-sm max-w-md" />
          <Button onClick={copyLink} variant="outline" size="icon">
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.totalReferrals}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Commission</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600">R{data.pendingCommission.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved Commission</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-600">R{data.approvedCommission.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Referral History</CardTitle>
        </CardHeader>
        <CardContent>
          {data.referrals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p>No referrals yet. Share your code to start earning!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {data.referrals.map((ref: any) => (
                    <tr key={ref.id} className="border-b last:border-0">
                      <td className="py-3">{new Date(ref.createdAt).toLocaleDateString()}</td>
                      <td className="py-3">
                        <Badge variant={ref.status === "approved" ? "default" : ref.status === "pending" ? "secondary" : "outline"}>
                          {ref.status}
                        </Badge>
                      </td>
                      <td className="py-3 font-medium">
                        R{Number(ref.commission).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">1</span>
            </div>
            <div>
              <p className="font-medium">Share your referral link</p>
              <p className="text-sm text-muted-foreground">Share your unique referral link with friends and colleagues</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">2</span>
            </div>
            <div>
              <p className="font-medium">They sign up and purchase</p>
              <p className="text-sm text-muted-foreground">When someone uses your link and purchases a plan, you earn commission</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">3</span>
            </div>
            <div>
              <p className="font-medium">Earn 10% commission</p>
              <p className="text-sm text-muted-foreground">You earn 10% of every sale made through your referral link</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
