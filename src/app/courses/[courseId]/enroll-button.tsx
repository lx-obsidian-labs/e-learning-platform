"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { enrollInCourse } from "@/actions/enrollments"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import Link from "next/link"

type Props = {
  courseId: string
  courseSlug: string
  enrolled: boolean
}

export function EnrollButton({ courseId, courseSlug, enrolled }: Props) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function handleEnroll() {
    setPending(true)
    const result = await enrollInCourse(courseId)
    if (result.success) {
      toast.success("Enrolled successfully!")
      router.refresh()
    } else {
      toast.error(result.error ?? "Failed to enroll")
      setPending(false)
    }
  }

  return enrolled ? (
    <Button asChild size="lg">
      <Link href={`/courses/${courseSlug}`}>Continue Learning</Link>
    </Button>
  ) : (
    <Button size="lg" onClick={handleEnroll} disabled={pending}>
      {pending ? "Enrolling..." : "Enroll Free"}
    </Button>
  )
}
