import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const admin = createAdminClient()
  const { data: userProfile } = await admin
    .from('users')
    .select('role')
    .eq('"id"', user.id)
    .single()

  if (userProfile?.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Panel</h1>
      <p className="text-muted-foreground">
        Manage users, categories, and platform settings.
      </p>
    </div>
  )
}
