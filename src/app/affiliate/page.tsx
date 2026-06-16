import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AffiliateDashboard } from "./affiliate-dashboard"
import { getOrCreateAffiliate } from "@/actions/affiliates"

export const dynamic = "force-dynamic"

export default async function AffiliatePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const affiliate = await getOrCreateAffiliate()
  if (!affiliate) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Affiliate Program</h1>
          <p className="text-muted-foreground mt-1">Refer friends and earn commission on every sale</p>
        </div>
        <AffiliateDashboard />
      </div>
    </div>
  )
}
