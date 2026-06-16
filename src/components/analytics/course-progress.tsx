"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { CourseAnalytics } from "@/actions/analytics"

interface CourseProgressListProps {
  courses: CourseAnalytics[]
}

function statusBadge(status: string) {
  switch (status) {
    case "COMPLETED":
      return <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50 dark:bg-green-950/30">COMPLETED</Badge>
    case "IN_PROGRESS":
      return <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/30">IN PROGRESS</Badge>
    default:
      return <Badge variant="outline" className="border-muted-foreground text-muted-foreground">NOT STARTED</Badge>
  }
}

function progressColor(status: string) {
  switch (status) {
    case "COMPLETED": return "bg-green-500"
    case "IN_PROGRESS": return "bg-blue-500"
    default: return "bg-muted-foreground/30"
  }
}

export function CourseProgressList({ courses }: CourseProgressListProps) {
  if (courses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Course Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-4 text-center">
            No courses enrolled.{" "}
            <Link href="/courses" className="text-primary hover:underline">Browse courses</Link>
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {courses.map((course) => (
          <Link
            key={course.courseId}
            href={`/courses/${course.slug}`}
            className="block rounded-lg border p-4 hover:ring-1 hover:ring-indigo-500/30 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-sm truncate">{course.title}</h3>
              {statusBadge(course.status)}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", progressColor(course.status))}
                  style={{ width: `${course.progress}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {course.progress}% ({course.completedLessons}/{course.totalLessons} lessons)
              </span>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
