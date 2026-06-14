"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { markLessonComplete } from "@/actions/completions"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type Props = {
  lessonId: string
}

export function CompleteButton({ lessonId }: Props) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function handleComplete() {
    setPending(true)
    const result = await markLessonComplete(lessonId)
    if (result.success) {
      toast.success("Lesson completed!")
      router.refresh()
    } else {
      toast.error(result.error ?? "Failed to mark complete")
      setPending(false)
    }
  }

  return (
    <Button onClick={handleComplete} disabled={pending}>
      {pending ? "Saving..." : "Mark as Complete"}
    </Button>
  )
}
