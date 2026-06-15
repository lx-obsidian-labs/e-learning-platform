import { getCategories } from "@/actions/categories"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect, notFound } from "next/navigation"
import { CourseForm } from "../course-form"
import { ModuleList } from "./module-list"

export const dynamic = "force-dynamic"

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const admin = createAdminClient()

  const { data: userProfile } = await admin
    .from('users')
    .select('role')
    .eq('"id"', user.id)
    .single()

  if (!userProfile || userProfile.role === "STUDENT") redirect("/login")

  const { courseId } = await params

  const { data: course } = await admin
    .from('courses')
    .select('*')
    .eq('"id"', courseId)
    .single()

  if (!course) notFound()

  if (course.instructorId !== user.id && userProfile.role !== "ADMIN") {
    redirect("/instructor/courses")
  }

  const { data: modules } = await admin
    .from('modules')
    .select('*, lessons:lessons(*), quizzes:quizzes(*, questions:quiz_questions(*, options:quiz_answer_options(*)))')
    .eq('"courseId"', course.id)
    .order('"order"', { ascending: true })

  const enrichedCourse = {
    ...course,
    modules: modules?.map((m: any) => ({
      ...m,
      lessons: (m.lessons || []).sort((a: any, b: any) => a.order - b.order),
      quizzes: (m.quizzes || []).map((q: any) => ({
        ...q,
        questions: (q.questions || []).sort((a: any, b: any) => a.order - b.order).map((qst: any) => ({
          ...qst,
          options: qst.options || [],
        })),
      })),
    })) || [],
  }

  const categories = await getCategories()

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Edit Course</h1>
        <p className="text-muted-foreground">{enrichedCourse.title}</p>
      </div>

      <CourseForm
        categories={categories}
        initialData={{
          id: enrichedCourse.id,
          title: enrichedCourse.title,
          description: enrichedCourse.description,
          price: Number(enrichedCourse.price),
          isFree: enrichedCourse.isFree,
          categoryId: enrichedCourse.categoryId,
          status: enrichedCourse.status,
        }}
      />

      <ModuleList courseId={enrichedCourse.id} modules={enrichedCourse.modules} />
    </div>
  )
}
