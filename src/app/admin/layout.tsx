import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import Link from "next/link"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const admin = createAdminClient()
  const { data: profile } = await admin.from("users").select("role").eq('"id"', user.id).single()
  if (profile?.role !== "ADMIN") redirect("/dashboard")

  const nav = [
    { label: "Dashboard", href: "/admin" },
    { label: "Users", href: "/admin/users" },
    { label: "Courses", href: "/admin/courses" },
    { label: "Discussions", href: "/admin/discussions" },
    { label: "Payments", href: "/admin/payments" },
    { label: "Import", href: "/admin/import" },
  ]

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r bg-muted/30 p-4 space-y-2">
        <h2 className="font-semibold text-lg mb-4">Admin</h2>
        {nav.map((n) => (
          <Link key={n.href} href={n.href} className="block px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors">
            {n.label}
          </Link>
        ))}
      </aside>
      <main className="flex-1 p-4 sm:p-6">{children}</main>
    </div>
  )
}
