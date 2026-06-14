"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { submitQuizAttempt } from "@/actions/quizzes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

type Question = {
  id: string
  text: string
  type: string
  points: number
  options: { id: string; text: string }[]
}

type Props = {
  quizId: string
  questions: Question[]
}

type Result = {
  attempt: { id: string; score: number; total: number }
} | null

export function QuizForm({ quizId, questions }: Props) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<Result>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    const formatted = Object.entries(answers).map(([questionId, value]) => {
      const q = questions.find((q) => q.id === questionId)
      if (!q) return { questionId, optionId: value }

      if (q.type === "SHORT_ANSWER") {
        return { questionId, textAnswer: value }
      }
      return { questionId, optionId: value }
    })

    const res = await submitQuizAttempt(quizId, formatted)
    if (res.success) {
      setResult(res.attempt)
      toast.success("Quiz submitted!")
      router.refresh()
    } else {
      toast.error(res.error ?? "Failed to submit")
    }
    setSubmitting(false)
  }

  if (result) {
    const percentage = Math.round((result.attempt.score / result.attempt.total) * 100)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz Complete</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-6">
            <p className="text-5xl font-bold">{percentage}%</p>
            <p className="text-muted-foreground mt-2">
              {result.attempt.score} / {result.attempt.total} points
            </p>
          </div>
          <div className="flex gap-3">
            <Button className="flex-1" onClick={() => { setResult(null); setAnswers({}) }}>
              Retry Quiz
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => router.back()}>
              Back to Course
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {questions.map((q, idx) => (
        <Card key={q.id}>
          <CardHeader>
            <CardTitle className="text-base">
              {idx + 1}. {q.text}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({q.points} {q.points === 1 ? "point" : "points"})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(q.type === "MULTIPLE_CHOICE" || q.type === "TRUE_FALSE") && (
              <RadioGroup
                value={answers[q.id] ?? ""}
                onValueChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
              >
                {q.options.map((o) => (
                  <div key={o.id} className="flex items-center gap-2">
                    <RadioGroupItem value={o.id} id={o.id} />
                    <Label htmlFor={o.id}>{o.text}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {q.type === "SHORT_ANSWER" && (
              <Input
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                placeholder="Type your answer..."
              />
            )}
          </CardContent>
        </Card>
      ))}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Submitting..." : "Submit Quiz"}
      </Button>
    </form>
  )
}
