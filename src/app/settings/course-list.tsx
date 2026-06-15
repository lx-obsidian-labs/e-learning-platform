"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { motion } from "@/components/motion"
import { BookOpen } from "lucide-react"

type Enrollment = {
  id: string
  userId: string
  courseId: string
  status: string
  progress: number
  enrolledAt: string
  course: {
    id: string
    title: string
    slug: string
    thumbnail: string | null
    instructor: { name: string } | null
    modules: { id: string; lessons: { id: string }[] }[]
  }
}

type Props = {
  role: string
  enrollments: any[]
  instructorCourses: {
    id: string
    title: string
    slug: string
    status: string
    thumbnail: string | null
    createdAt: string
  }[]
}

export function SettingsCourseList({ role, enrollments, instructorCourses }: Props) {
  const showStudent = role === "STUDENT" && enrollments.length > 0
  const showInstructor = role === "INSTRUCTOR" && instructorCourses.length > 0

  if (!showStudent && !showInstructor) return null

  return (
    <div className="space-y-8">
      {showStudent && (
        <div>
          <div className="flex items-center gap-2 mb-5">
            <BookOpen className="h-5 w-5 text-indigo-500" />
            <h2 className="text-xl font-bold">My Courses</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {enrollments.length}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enr: Enrollment, i: number) => {
              const totalLessons = enr.course.modules.reduce((acc, m) => acc + m.lessons.length, 0)
              const pct = totalLessons > 0 ? Math.round((enr.progress / totalLessons) * 100) : 0
              return (
                <motion.div
                  key={enr.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={`/courses/${enr.course.slug}`}
                    className="group block rounded-xl border border-border/50 bg-card/50 hover:border-indigo-200/50 dark:hover:border-indigo-800/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 overflow-hidden"
                  >
                    {enr.course.thumbnail ? (
                      <img src={enr.course.thumbnail} alt="" className="w-full h-28 object-cover" />
                    ) : (
                      <div className="w-full h-28 bg-gradient-to-br from-indigo-500 to-purple-600" />
                    )}
                    <div className="p-4">
                      <p className="text-sm font-semibold line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {enr.course.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {enr.course.instructor?.name}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Progress value={pct} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{pct}%</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant={enr.status === "COMPLETED" ? "default" : "secondary"} className="text-[10px] h-5">
                          {enr.status === "COMPLETED" ? "Completed" : enr.status === "IN_PROGRESS" ? "In Progress" : "Not Started"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {enr.progress}/{totalLessons} lessons
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {showInstructor && (
        <div>
          <div className="flex items-center gap-2 mb-5">
            <BookOpen className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl font-bold">My Courses</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {instructorCourses.length}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {instructorCourses.map((course: Props["instructorCourses"][0], i: number) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/instructor/courses/${course.id}`}
                  className="group block rounded-xl border border-border/50 bg-card/50 hover:border-amber-200/50 dark:hover:border-amber-800/50 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 overflow-hidden"
                >
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt="" className="w-full h-28 object-cover" />
                  ) : (
                    <div className="w-full h-28 bg-gradient-to-br from-amber-500 to-orange-600" />
                  )}
                  <div className="p-4">
                    <p className="text-sm font-semibold line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {course.title}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="outline" className="text-[10px] h-5">
                        {course.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(course.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
