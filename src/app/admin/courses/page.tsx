import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AdminCoursesPage() {
  const admin = createAdminClient()

  const { data: courses } = await admin
    .from("courses")
    .select("*, users!courses_instructorId_fkey(name), categories!courses_categoryId_fkey(name)")
    .order('"createdAt"', { ascending: false })

  const { count: totalCount } = await admin
    .from("courses")
    .select("*", { count: 'exact', head: true })

  const { count: publishedCount } = await admin
    .from("courses")
    .select("*", { count: 'exact', head: true })
    .eq('"status"', "PUBLISHED")

  const { count: draftCount } = await admin
    .from("courses")
    .select("*", { count: 'exact', head: true })
    .eq('"status"', "DRAFT")

  const list = courses || []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Courses</h1>
        <p className="text-muted-foreground mt-1">Manage all courses on the platform</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{totalCount || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">Published</p>
            <p className="text-2xl font-bold">{publishedCount || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">Drafts</p>
            <p className="text-2xl font-bold">{draftCount || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">Import</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{list.length}</p>
              <Button variant="ghost" size="sm" className="text-xs" asChild>
                <Link href="/admin/import">Manage</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {list.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <p className="text-muted-foreground">No courses yet.</p>
            <Button asChild>
              <Link href="/admin/import">Import Courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Title</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Instructor</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Category</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Price</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {list.map((course: any) => (
                  <tr key={course.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium">{course.title}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{course.users?.name || "Unknown"}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      <Badge variant="secondary" className="text-[10px]">
                        {course.categories?.name || "Uncategorized"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {course.isFree ? (
                        <span className="text-green-600 font-medium">Free</span>
                      ) : (
                        `$${Number(course.price).toFixed(2)}`
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={course.status === "PUBLISHED" ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {course.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/courses/${course.slug}`}>View</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
