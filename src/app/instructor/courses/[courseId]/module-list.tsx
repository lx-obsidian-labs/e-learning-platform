"use client"

import { useState } from "react"
import { createModule, deleteModule } from "@/actions/modules"
import { createLesson, deleteLesson } from "@/actions/lessons"
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
  onSuccess,
}: {
  moduleId: string
  onSuccess: () => void
}) {
  const [open, setOpen] = useState(false)

  async function action(formData: FormData) {
    const result = await createLesson(moduleId, formData)
    if (result.success) {
      toast.success("Lesson created")
      setOpen(false)
      onSuccess()
    } else {
      toast.error(typeof result.error === "string" ? result.error : "Invalid input")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Add Lesson</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Lesson</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={2} />
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
              <Input id="duration" name="duration" type="number" min="1" />
            </div>
            <div className="flex items-end gap-2 pb-2">
              <Checkbox id="isPreviewable" name="isPreviewable" />
              <Label htmlFor="isPreviewable">Previewable</Label>
            </div>
          </div>
          <Button type="submit">Create Lesson</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function LessonItem({
  lesson,
  onDelete,
}: {
  lesson: Module["lessons"][0]
  onDelete: () => void
}) {
  const [deleting, setDeleting] = useState(false)

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
              mod.lessons.map((lesson) => (
                <LessonItem
                  key={lesson.id}
                  lesson={lesson}
                  onDelete={() => {}}
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
