import { prisma } from "@/lib/prisma"
import { getCategories } from "@/actions/categories"
import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { CourseForm } from "../course-form"
import { ModuleList } from "./module-list"

export const dynamic = "force-dynamic"

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const session = await auth()
  if (!session?.user || session.user.role === "STUDENT") redirect("/login")

  const { courseId } = await params

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
          },
          quizzes: {
            include: {
              questions: {
                orderBy: { order: "asc" },
                include: {
                  options: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!course) notFound()

  if (course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
    redirect("/instructor/courses")
  }

  const categories = await getCategories()

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Edit Course</h1>
        <p className="text-muted-foreground">{course.title}</p>
      </div>

      <CourseForm
        categories={categories}
        initialData={{
          id: course.id,
          title: course.title,
          description: course.description,
          price: Number(course.price),
          isFree: course.isFree,
          categoryId: course.categoryId,
          status: course.status,
        }}
      />

      <ModuleList courseId={course.id} modules={course.modules} />
    </div>
  )
}
