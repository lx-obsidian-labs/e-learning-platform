import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getStudentEnrollments } from "@/actions/enrollments"
import { redirect } from "next/navigation"
import { ProfileView } from "./profile-view"
import { SettingsCourseList } from "./course-list"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from("users")
    .select("*")
    .eq('"id"', user.id)
    .maybeSingle()

  if (!profile) redirect("/auth/login")

  const isInstructor = profile.role === "INSTRUCTOR"

  let instructorCourses: any[] = []
  let totalStudents = 0
  if (isInstructor) {
    const { data: courses } = await admin
      .from("courses")
      .select("id, title, slug, status, thumbnail, createdAt")
      .eq('"instructorId"', user.id)
      .order('"createdAt"', { ascending: false })
    instructorCourses = courses || []

    const courseIds = instructorCourses.map((c: any) => c.id)
    if (courseIds.length > 0) {
      const { count } = await admin
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .in('"courseId"', courseIds)
      totalStudents = count ?? 0
    }
  }

  const enrollments = await getStudentEnrollments()

  const completedCourses = enrollments.filter((e: any) => e.status === "COMPLETED").length
  const inProgressCourses = enrollments.filter((e: any) => e.status === "IN_PROGRESS").length
  const totalLessonsCompleted = enrollments.reduce((acc: number, e: any) => acc + (e.progress || 0), 0)

  return (
    <div className="min-h-screen pt-16">
      <ProfileView
        name={profile.name ?? ""}
        email={user.email ?? ""}
        bio={profile.bio ?? ""}
        image={profile.image ?? ""}
        role={profile.role}
        createdAt={profile.createdAt}
        completedCourses={completedCourses}
        inProgressCourses={inProgressCourses}
        totalLessonsCompleted={totalLessonsCompleted}
        totalStudents={totalStudents}
        instructorCourseCount={instructorCourses.length}
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 pb-16">
        <SettingsCourseList
          role={profile.role}
          enrollments={enrollments}
          instructorCourses={instructorCourses}
        />
      </div>
    </div>
  )
}
