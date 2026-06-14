import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

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
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login")
  }

  if (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
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
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}
