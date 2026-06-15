import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const admin = createAdminClient()
  const { data: profile } = await admin.from("users").select("role").eq('"id"', user.id).single()
  if (profile?.role !== "ADMIN") redirect("/dashboard")

  const { count: courseCount } = await admin.from("courses").select("*", { count: "exact", head: true })
  const { count: userCount } = await admin.from("users").select("*", { count: "exact", head: true })
  const { count: enrollmentCount } = await admin.from("enrollments").select("*", { count: "exact", head: true })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Panel</h1>
      <p className="text-muted-foreground">Manage platform content, users, and imports.</p>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-2xl font-bold">{courseCount || 0}</p>
          <p className="text-sm text-muted-foreground">Courses</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-2xl font-bold">{userCount || 0}</p>
          <p className="text-sm text-muted-foreground">Users</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-2xl font-bold">{enrollmentCount || 0}</p>
          <p className="text-sm text-muted-foreground">Enrollments</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/admin/import" className="rounded-lg border p-4 hover:bg-muted/50 transition-colors">
          <h3 className="font-semibold">Import Courses</h3>
          <p className="text-sm text-muted-foreground">Upload JSON/CSV files or import from external sources</p>
        </Link>
        <Link href="/admin/courses" className="rounded-lg border p-4 hover:bg-muted/50 transition-colors">
          <h3 className="font-semibold">Manage Courses</h3>
          <p className="text-sm text-muted-foreground">View and manage all platform courses</p>
        </Link>
      </div>
    </div>
  )
}
