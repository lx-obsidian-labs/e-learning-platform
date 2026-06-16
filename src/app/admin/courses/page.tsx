import { getCourses, updateCourseStatus } from "@/actions/admin"
import { CoursesTable } from "./courses-table"

export const dynamic = "force-dynamic"

type Props = {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>
}

export default async function AdminCoursesPage({ searchParams }: Props) {
  const params = await searchParams
  const { courses, total, page, pageSize } = await getCourses(
    params.page ? Number(params.page) : 1,
    params.search,
    params.status
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Courses</h1>
        <p className="text-muted-foreground">{total} total courses</p>
      </div>

      <CoursesTable courses={courses} total={total} page={page} pageSize={pageSize} />
    </div>
  )
}
