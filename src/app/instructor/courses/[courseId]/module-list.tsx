"use client"

import { useState } from "react"
import { createModule, deleteModule } from "@/actions/modules"
import { createLesson, updateLesson, deleteLesson, reorderLesson } from "@/actions/lessons"
import { QuizManager } from "./quiz-manager"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"

type Quiz = {
  id: string
  title: string
  description: string | null
  passingScore: number | null
  questions: {
    id: string
    text: string
    type: string
    points: number
    order: number
    options: {
      id: string
      text: string
      isCorrect: boolean
    }[]
  }[]
}

type Module = {
  id: string
  title: string
  description: string | null
  order: number
  lessons: {
    id: string
    title: string
    description: string | null
    isPreviewable: boolean
    duration: number | null
    order: number
  }[]
  quizzes: Quiz[]
}

type Props = {
  courseId: string
  modules: Module[]
}

function LessonForm({
  moduleId,
  initialData,
  onSuccess,
}: {
  moduleId: string
  initialData?: Module["lessons"][0]
  onSuccess: () => void
}) {
  const [open, setOpen] = useState(false)
  const isEditing = !!initialData

  async function action(formData: FormData) {
    const result = initialData
      ? await updateLesson(initialData.id, formData)
      : await createLesson(moduleId, formData)
    if (result.success) {
      toast.success(isEditing ? "Lesson updated" : "Lesson created")
      setOpen(false)
      onSuccess()
    } else {
      toast.error(typeof result.error === "string" ? result.error : "Invalid input")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {initialData ? (
          <Button variant="ghost" size="sm" className="h-6 px-2">Edit</Button>
        ) : (
          <Button variant="outline" size="sm">Add Lesson</Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Lesson" : "New Lesson"}</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required defaultValue={initialData?.title ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={2} defaultValue={initialData?.description ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content (HTML / markdown)</Label>
            <Textarea id="content" name="content" rows={4} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="videoUrl">Video URL</Label>
            <Input id="videoUrl" name="videoUrl" placeholder="https://" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (min)</Label>
              <Input id="duration" name="duration" type="number" min="1" defaultValue={initialData?.duration ?? ""} />
            </div>
            <div className="flex items-end gap-2 pb-2">
              <Checkbox id="isPreviewable" name="isPreviewable" defaultChecked={initialData?.isPreviewable ?? false} />
              <Label htmlFor="isPreviewable">Previewable</Label>
            </div>
          </div>
          <Button type="submit">{isEditing ? "Update Lesson" : "Create Lesson"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function LessonItem({
  moduleId,
  lesson,
  lessons,
  lessonIndex,
  onDelete,
  onReorder,
}: {
  moduleId: string
  lesson: Module["lessons"][0]
  lessons: Module["lessons"]
  lessonIndex: number
  onDelete: () => void
  onReorder: () => void
}) {
  const [deleting, setDeleting] = useState(false)
  const [reordering, setReordering] = useState(false)
  const isFirst = lessonIndex === 0
  const isLast = lessonIndex === lessons.length - 1

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteLesson(lesson.id)
    if (result.success) {
      toast.success("Lesson deleted")
      onDelete()
    } else {
      toast.error("Failed to delete")
      setDeleting(false)
    }
  }

  async function handleReorder(dir: "up" | "down") {
    setReordering(true)
    const result = await reorderLesson(lesson.id, dir)
    if (result.success) {
      onReorder()
    } else {
      toast.error(result.error || "Failed to reorder")
    }
    setReordering(false)
  }

  return (
    <div className="flex items-center justify-between rounded border px-3 py-2 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{lesson.order}.</span>
        <span>{lesson.title}</span>
        {lesson.isPreviewable && (
          <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            Preview
          </span>
        )}
        {lesson.duration && (
          <span className="text-xs text-muted-foreground">{lesson.duration}min</span>
        )}
      </div>
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-1 text-muted-foreground hover:text-foreground"
          disabled={isFirst || reordering}
          onClick={() => handleReorder("up")}
          title="Move up"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-1 text-muted-foreground hover:text-foreground"
          disabled={isLast || reordering}
          onClick={() => handleReorder("down")}
          title="Move down"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </Button>
        <LessonForm moduleId={moduleId} initialData={lesson} onSuccess={onReorder} />
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive h-6 px-2"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "..." : "×"}
        </Button>
      </div>
    </div>
  )
}

export function ModuleList({ courseId, modules }: Props) {
  const [moduleTitle, setModuleTitle] = useState("")
  const [adding, setAdding] = useState(false)

  async function handleAddModule() {
    if (!moduleTitle.trim()) return
    setAdding(true)
    const fd = new FormData()
    fd.set("title", moduleTitle)
    const result = await createModule(courseId, fd)
    if (result.success) {
      toast.success("Module created")
      setModuleTitle("")
    } else {
      toast.error(typeof result.error === "string" ? result.error : "Invalid input")
    }
    setAdding(false)
  }

  async function handleDeleteModule(id: string) {
    const result = await deleteModule(id)
    if (result.success) {
      toast.success("Module deleted")
    } else {
      toast.error("Failed to delete")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Course Content ({modules.length} modules)</h2>
      </div>

      {modules.map((mod) => (
        <Card key={mod.id}>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  Module {mod.order}: {mod.title}
                </CardTitle>
                {mod.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">{mod.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive h-7 px-2"
                  onClick={() => handleDeleteModule(mod.id)}
                >
                  ×
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pb-4">
            {mod.lessons.length === 0 ? (
              <p className="text-sm text-muted-foreground">No lessons yet</p>
            ) : (
              mod.lessons.map((lesson, li) => (
                <LessonItem
                  key={lesson.id}
                  moduleId={mod.id}
                  lesson={lesson}
                  lessons={mod.lessons}
                  lessonIndex={li}
                  onDelete={() => {}}
                  onReorder={() => {}}
                />
              ))
            )}
            <LessonForm moduleId={mod.id} onSuccess={() => {}} />
            <QuizManager moduleId={mod.id} quizzes={mod.quizzes} />
          </CardContent>
        </Card>
      ))}

      <Card className="border-dashed">
        <CardContent className="py-4">
          <div className="flex gap-3">
            <Input
              placeholder="New module title"
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
            />
            <Button onClick={handleAddModule} disabled={adding || !moduleTitle.trim()}>
              {adding ? "Adding..." : "Add Module"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
