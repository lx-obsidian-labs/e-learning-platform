import { getCategories } from "@/actions/categories"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
import { CourseForm } from "../course-form"

export default async function NewCoursePage() {
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

  const categories = await getCategories()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Course</h1>
        <p className="text-muted-foreground">Set up a new course for your students</p>
      </div>
      <CourseForm categories={categories} />
    </div>
  )
}
