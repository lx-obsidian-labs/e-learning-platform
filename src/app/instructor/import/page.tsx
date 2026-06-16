import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { ImportForm } from "./import-form"
import { EdxImportForm } from "./edx-import-form"

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
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Import Courses</h1>
        <p className="text-muted-foreground">
          Browse and import free courses from external sources
        </p>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">Free Open Courses</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Import courses from Khan Academy, Wikiversity, OpenStax, freeCodeCamp, and OpenLearn
        </p>
        <ImportForm />
      </section>

      <section className="border-t pt-8">
        <h2 className="text-xl font-semibold mb-4">edX Courses</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Browse and import free courses from edX with video lessons
        </p>
        <EdxImportForm />
      </section>
    </div>
  )
}
