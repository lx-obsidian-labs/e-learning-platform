import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { OrdersList } from "./orders-list"

export const dynamic = "force-dynamic"

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  return (
    <div className="min-h-screen pt-16 sm:pt-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
          <p className="lead">Track your payments and plan subscriptions</p>
        </div>
        <OrdersList />
      </div>
    </div>
  )
}
