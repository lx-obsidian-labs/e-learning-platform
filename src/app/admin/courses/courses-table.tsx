"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateCourseStatus } from "@/actions/admin"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, ChevronLeft, ChevronRight, CheckCircle, Archive, FileEdit } from "lucide-react"
import { toast } from "sonner"

type Course = {
  id: string
  title: string
  slug: string
  description: string | null
  price: number | null
  status: string
  instructorId: string
  createdAt: string
  users: { name: string } | null
  enrollmentCount: number
}

type Props = {
  courses: Course[]
  total: number
  page: number
  pageSize: number
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
  PUBLISHED: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400",
  ARCHIVED: "bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-400",
}

export function CoursesTable({ courses, total, page, pageSize }: Props) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const router = useRouter()

  const totalPages = Math.ceil(total / pageSize)

  function handleFilter() {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (statusFilter && statusFilter !== "ALL") params.set("status", statusFilter)
    router.push(`/admin/courses?${params.toString()}`)
  }

  function goToPage(p: number) {
    const params = new URLSearchParams(window.location.search)
    params.set("page", String(p))
    router.push(`/admin/courses?${params.toString()}`)
  }

  async function handleStatusChange(courseId: string, status: string) {
    const result = await updateCourseStatus(courseId, status)
    if (result.success) {
      toast.success(`Course ${status.toLowerCase()}`)
      router.refresh()
    } else {
      toast.error(result.error || "Failed to update status")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFilter()}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleFilter}>Filter</Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Enrollments</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No courses found
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium text-sm max-w-[200px] truncate">
                    {course.title}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {course.users?.name || "Unknown"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {course.price ? `$${Number(course.price).toFixed(2)}` : "Free"}
                  </TableCell>
                  <TableCell className="text-sm">{course.enrollmentCount}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${statusColors[course.status] || ""}`}>
                      {course.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {course.status !== "PUBLISHED" && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleStatusChange(course.id, "PUBLISHED")}
                          title="Publish"
                        >
                          <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                        </Button>
                      )}
                      {course.status !== "DRAFT" && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleStatusChange(course.id, "DRAFT")}
                          title="Set to Draft"
                        >
                          <FileEdit className="h-3.5 w-3.5 text-amber-600" />
                        </Button>
                      )}
                      {course.status !== "ARCHIVED" && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleStatusChange(course.id, "ARCHIVED")}
                          title="Archive"
                        >
                          <Archive className="h-3.5 w-3.5 text-gray-600" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {courses.length} of {total} courses
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
