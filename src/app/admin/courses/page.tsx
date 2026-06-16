import { getCourses, updateCourseStatus } from "@/actions/admin"
import { CoursesTable } from "./courses-table"
import { Card, CardContent } from "@/components/ui/card"

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
        <p className="lead">{total} total courses</p>
      </div>

      <Card variant="pro">
        <CardContent className="p-0">
          <CoursesTable courses={courses} total={total} page={page} pageSize={pageSize} />
        </CardContent>
      </Card>
    </div>
  )
}
