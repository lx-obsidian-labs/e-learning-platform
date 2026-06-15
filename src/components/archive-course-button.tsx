"use client"

import { useActionState } from "react"
import { deleteCourse } from "@/actions/courses"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function ArchiveCourseButton({ courseId, compact }: { courseId: string; compact?: boolean }) {
  const [state, action] = useActionState(async () => {
    const result = await deleteCourse(courseId)
    if (!result.success) {
      toast.error("Failed to archive course")
    }
  }, null)

  if (compact) {
    return (
      <form action={action}>
        <Button variant="ghost" size="sm" className="text-destructive h-8 px-2" title="Archive course">
          ×
        </Button>
      </form>
    )
  }

  return (
    <form action={action}>
      <Button variant="outline" size="sm" className="text-destructive border-destructive/30">
        Archive Course
      </Button>
    </form>
  )
}
