import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const navItems = [
  { label: "Overview", href: "/instructor" },
  { label: "My Courses", href: "/instructor/courses" },
  { label: "Import Courses", href: "/instructor/import" },
]

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

  if (userProfile?.role !== "INSTRUCTOR" && userProfile?.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex w-64 flex-col border-r bg-muted/30 p-4 gap-2">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            className="justify-start"
            asChild
          >
            <Link href={item.href}>{item.label}</Link>
          </Button>
        ))}
      </aside>
      <main className="flex-1 p-4 sm:p-6">
        {children}
      </main>
    </div>
  )
}
