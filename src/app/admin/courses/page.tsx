import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function AdminCoursesPage() {
  const admin = createAdminClient()

  const { data: courses } = await admin
    .from("courses")
    .select("*, users!courses_instructorId_fkey(name), categories!courses_categoryId_fkey(name)")
    .order('"createdAt"', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">All Courses</h1>

      <div className="grid gap-4">
        {(courses || []).length === 0 && (
          <p className="text-muted-foreground">No courses yet. Import some from the Import page.</p>
        )}
        {(courses || []).map((course: any) => (
          <Card key={course.id}>
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{course.title}</CardTitle>
                <Badge variant={course.status === "PUBLISHED" ? "default" : "secondary"}>{course.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="py-2 text-sm text-muted-foreground">
              <p>Instructor: {course.users?.name || "Unknown"}</p>
              <p>Category: {course.categories?.name || "Uncategorized"}</p>
              <p>Price: {course.isFree ? "Free" : `$${course.price}`}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
