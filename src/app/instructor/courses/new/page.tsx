import { getCategories } from "@/actions/categories"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
import { CourseForm } from "../course-form"

export default async function NewCoursePage() {
  const session = await auth()

  if (!session?.user || session.user.role === "STUDENT") {
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
