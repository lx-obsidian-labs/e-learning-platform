import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { ImportForm } from "./import-form"

export default async function ImportCoursePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const admin = createAdminClient()
  const { data: userProfile } = await admin
    .from('users')
    .select('role')
    .eq('"id"', user.id)
    .single()

  if (!userProfile || userProfile.role === "STUDENT") {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Import Free Courses</h1>
        <p className="text-muted-foreground">
          Browse free educational content from Khan Academy and other sources
        </p>
      </div>
      <ImportForm />
    </div>
  )
}
