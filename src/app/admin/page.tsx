import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login")
  }

  if (session.user.role !== "ADMIN") {
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
