"use client"

import { createCourse, updateCourse } from "@/actions/courses"
import { useRouter } from "next/navigation"
import { useActionState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

type Category = { id: string; name: string; slug: string }

type Props = {
  categories: Category[]
  initialData?: {
    id: string
    title: string
    description: string | null
    price: number
    isFree: boolean
    categoryId: string | null
    status: string
    thumbnail?: string | null
  }
}

export function CourseForm({ categories, initialData }: Props) {
  const router = useRouter()
  const [state, action, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const result = initialData
        ? await updateCourse(initialData.id, formData)
        : await createCourse(formData)

      if (result.success) {
        toast.success(initialData ? "Course updated" : "Course created")
        router.push("/instructor/courses")
        router.refresh()
      } else {
        const msg = typeof result.error === "string" ? result.error : "Please fix the errors below"
        toast.error(msg)
      }
      return result
    },
    null
  )

  return (
    <form action={action} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Course Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g. Complete Web Development Bootcamp"
          required
          defaultValue={initialData?.title}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Describe what students will learn..."
          rows={5}
          defaultValue={initialData?.description ?? ""}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <Select name="categoryId" defaultValue={initialData?.categoryId ?? undefined}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price ($)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            defaultValue={initialData?.price ?? 0}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="thumbnail">Thumbnail URL</Label>
        <Input
          id="thumbnail"
          name="thumbnail"
          placeholder="https://example.com/image.jpg"
          defaultValue={initialData?.thumbnail ?? ""}
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id="isFree" name="isFree" defaultChecked={initialData?.isFree ?? false} />
        <Label htmlFor="isFree">This is a free course</Label>
      </div>

      {initialData && (
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={initialData?.status}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : initialData ? "Update Course" : "Create Course"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
