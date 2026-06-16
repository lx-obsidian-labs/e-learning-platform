import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NotificationsList } from "./notifications-list"

export const dynamic = "force-dynamic"

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  return (
    <div className="min-h-screen pt-16 sm:pt-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="lead">Stay up to date with your learning activity</p>
        </div>
        <NotificationsList />
      </div>
    </div>
  )
}
