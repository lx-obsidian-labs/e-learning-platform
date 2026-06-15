"use client"

import { useState } from "react"
import { createQuiz, updateQuiz, deleteQuiz, addQuestion, updateQuestion, removeQuestion, addOption, updateOption, removeOption } from "@/actions/quizzes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"

type QuizData = {
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

type Props = {
  moduleId: string
  quizzes: QuizData[]
}

function QuestionForm({
  quizId,
  onDone,
}: {
  quizId: string
  onDone: () => void
}) {
  const [open, setOpen] = useState(false)

  async function action(formData: FormData) {
    const result = await addQuestion(quizId, formData)
    if (result.success) {
      toast.success("Question added")
      setOpen(false)
      onDone()
    } else {
      toast.error(typeof result.error === "string" ? result.error : "Invalid input")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Add Question</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Question</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text">Question Text</Label>
            <Textarea id="text" name="text" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select name="type" defaultValue="MULTIPLE_CHOICE">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                  <SelectItem value="TRUE_FALSE">True / False</SelectItem>
                  <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="points">Points</Label>
              <Input id="points" name="points" type="number" min="1" defaultValue="1" />
            </div>
          </div>
          <Button type="submit">Add Question</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditQuizDialog({
  quiz,
  onDone,
}: {
  quiz: QuizData
  onDone: () => void
}) {
  const [open, setOpen] = useState(false)

  async function action(formData: FormData) {
    const result = await updateQuiz(quiz.id, formData)
    if (result.success) {
      toast.success("Quiz updated")
      setOpen(false)
      onDone()
    } else {
      toast.error(typeof result.error === "string" ? result.error : "Invalid input")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 px-2">Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Quiz</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required defaultValue={quiz.title} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={2} defaultValue={quiz.description ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="passingScore">Passing Score (%)</Label>
            <Input id="passingScore" name="passingScore" type="number" min="0" max="100" defaultValue={quiz.passingScore ?? ""} />
          </div>
          <Button type="submit">Update Quiz</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditQuestionDialog({
  question,
  onDone,
}: {
  question: QuizData["questions"][0]
  onDone: () => void
}) {
  const [open, setOpen] = useState(false)

  async function action(formData: FormData) {
    const result = await updateQuestion(question.id, formData)
    if (result.success) {
      toast.success("Question updated")
      setOpen(false)
      onDone()
    } else {
      toast.error(typeof result.error === "string" ? result.error : "Invalid input")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-5 px-1">Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text">Question Text</Label>
            <Textarea id="text" name="text" required defaultValue={question.text} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select name="type" defaultValue={question.type}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                  <SelectItem value="TRUE_FALSE">True / False</SelectItem>
                  <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="points">Points</Label>
              <Input id="points" name="points" type="number" min="1" defaultValue={question.points} />
            </div>
          </div>
          <Button type="submit">Update Question</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditOptionDialog({
  option,
  onDone,
}: {
  option: QuizData["questions"][0]["options"][0]
  onDone: () => void
}) {
  const [open, setOpen] = useState(false)

  async function action(formData: FormData) {
    const result = await updateOption(option.id, formData)
    if (result.success) {
      toast.success("Option updated")
      setOpen(false)
      onDone()
    } else {
      toast.error(typeof result.error === "string" ? result.error : "Invalid input")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-primary hover:underline text-xs">Edit</button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Option</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text">Option Text</Label>
            <Input id="text" name="text" required defaultValue={option.text} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="isCorrect" name="isCorrect" defaultChecked={option.isCorrect} />
            <Label htmlFor="isCorrect">Correct answer</Label>
          </div>
          <Button type="submit">Update Option</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function OptionForm({
  questionId,
  onDone,
}: {
  questionId: string
  onDone: () => void
}) {
  const [open, setOpen] = useState(false)

  async function action(formData: FormData) {
    const result = await addOption(questionId, formData)
    if (result.success) {
      toast.success("Option added")
      setOpen(false)
      onDone()
    } else {
      toast.error(typeof result.error === "string" ? result.error : "Invalid input")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">+ Option</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Option</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text">Option Text</Label>
            <Input id="text" name="text" required />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="isCorrect" name="isCorrect" />
            <Label htmlFor="isCorrect">Correct answer</Label>
          </div>
          <Button type="submit">Add Option</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function QuizManager({ moduleId, quizzes }: Props) {
  const [title, setTitle] = useState("")
  const [creating, setCreating] = useState(false)

  async function handleCreate() {
    if (!title.trim()) return
    setCreating(true)
    const fd = new FormData()
    fd.set("title", title)
    const result = await createQuiz(moduleId, fd)
    if (result.success) {
      toast.success("Quiz created")
      setTitle("")
    } else {
      toast.error("Failed to create quiz")
    }
    setCreating(false)
  }

  async function handleDeleteQuiz(id: string) {
    const result = await deleteQuiz(id)
    if (result.success) {
      toast.success("Quiz deleted")
    } else {
      toast.error("Failed to delete quiz")
    }
  }

  async function handleDeleteQuestion(id: string) {
    const result = await removeQuestion(id)
    if (result.success) {
      toast.success("Question removed")
    } else {
      toast.error("Failed to remove question")
    }
  }

  async function handleDeleteOption(id: string) {
    const result = await removeOption(id)
    if (result.success) {
      toast.success("Option removed")
    } else {
      toast.error("Failed to remove option")
    }
  }

  return (
    <div className="space-y-3 mt-4 border-t pt-4">
      <h4 className="font-medium text-sm text-muted-foreground">Quizzes</h4>

      {quizzes.map((quiz) => (
        <Card key={quiz.id} className="border-dashed">
          <CardHeader className="py-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">{quiz.title}</CardTitle>
                {quiz.description && (
                  <p className="text-xs text-muted-foreground">{quiz.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                {quiz.passingScore && (
                  <span className="text-xs text-muted-foreground">Pass: {quiz.passingScore}%</span>
                )}
                <EditQuizDialog quiz={quiz} onDone={() => {}} />
                <Button variant="ghost" size="sm" className="text-destructive h-6 px-2" onClick={() => handleDeleteQuiz(quiz.id)}>
                  ×
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pb-3">
            {quiz.questions.length === 0 ? (
              <p className="text-xs text-muted-foreground">No questions yet</p>
            ) : (
              quiz.questions.map((q) => (
                <div key={q.id} className="rounded border p-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-medium">{q.order}.</span> {q.text}
                      <span className="text-xs text-muted-foreground ml-2">({q.type}, {q.points}pt)</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <EditQuestionDialog question={q} onDone={() => {}} />
                      <Button variant="ghost" size="sm" className="text-destructive h-5 px-1" onClick={() => handleDeleteQuestion(q.id)}>
                        ×
                      </Button>
                    </div>
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {q.options.map((o) => (
                      <div key={o.id} className="flex items-center gap-2 text-xs">
                        <span className={o.isCorrect ? "text-green-600 font-medium" : "text-muted-foreground"}>
                          {o.isCorrect ? "✓" : "○"} {o.text}
                        </span>
                        <span className="ml-auto flex items-center gap-1">
                          <EditOptionDialog option={o} onDone={() => {}} />
                          <button
                            className="text-destructive hover:underline"
                            onClick={() => handleDeleteOption(o.id)}
                          >
                            ×
                          </button>
                        </span>
                      </div>
                    ))}
                    <OptionForm questionId={q.id} onDone={() => {}} />
                  </div>
                </div>
              ))
            )}
            <QuestionForm quizId={quiz.id} onDone={() => {}} />
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-2">
        <Input
          placeholder="New quiz title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-8 text-sm"
        />
        <Button size="sm" onClick={handleCreate} disabled={creating || !title.trim()}>
          Add Quiz
        </Button>
      </div>
    </div>
  )
}
