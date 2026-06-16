"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { submitReview } from "@/actions/spaced-repetition"
import { Brain, CheckCircle2 } from "lucide-react"

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "")
}

function extractKeyPoints(content: string, maxChars = 500): string {
  const text = stripHtml(content)
  return text.slice(0, maxChars) + (text.length > maxChars ? "..." : "")
}

interface ReviewSessionProps {
  lessonId: string
  lessonTitle: string
  lessonContent: string
  onComplete: () => void
}

export function ReviewSession({ lessonId, lessonTitle, lessonContent, onComplete }: ReviewSessionProps) {
  const [step, setStep] = useState<"recall" | "score" | "result">("recall")
  const [userRecall, setUserRecall] = useState("")
  const [quality, setQuality] = useState<number | null>(null)
  const [result, setResult] = useState<{ interval: number; nextReviewAt: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const keyPoints = extractKeyPoints(lessonContent, 500)

  async function handleScore(score: number) {
    setQuality(score)
    setSubmitting(true)
    const res = await submitReview(lessonId, score)
    if (!("error" in res)) {
      setResult(res)
    }
    setSubmitting(false)
    setStep("result")
  }

  function handleFinish() {
    onComplete()
  }

  return (
    <div className="space-y-6">
      <Card variant="pro">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-500" />
            <CardTitle>{lessonTitle}</CardTitle>
          </div>
          <CardDescription>Spaced Repetition Review</CardDescription>
        </CardHeader>
      </Card>

      {step === "recall" && (
        <>
          <Card variant="pro">
            <CardHeader>
              <CardTitle>Key Points</CardTitle>
              <CardDescription>Review the key points from this lesson</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{keyPoints}</p>
            </CardContent>
          </Card>

          <Card variant="pro">
            <CardHeader>
              <CardTitle>What do you remember?</CardTitle>
              <CardDescription>Write down everything you recall from this lesson</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={userRecall}
                onChange={(e) => setUserRecall(e.target.value)}
                placeholder="Type what you remember here..."
                className="min-h-[150px]"
              />
              {userRecall.trim().length > 0 && (
                <div className="mt-4 flex justify-end">
                  <Button onClick={() => setStep("score")}>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Submit Recall
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {step === "score" && (
        <Card variant="pro">
          <CardHeader>
            <CardTitle>How well did you remember?</CardTitle>
            <CardDescription>Rate your recall quality from 0 (nothing) to 5 (perfect)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { value: 0, label: "Blackout", desc: "Nothing" },
                { value: 1, label: "Wrong", desc: "Incorrect" },
                { value: 2, label: "Faint", desc: "Vague" },
                { value: 3, label: "Partial", desc: "Somewhat" },
                { value: 4, label: "Good", desc: "Mostly" },
                { value: 5, label: "Perfect", desc: "Complete" },
              ].map((opt) => (
                <Button
                  key={opt.value}
                  variant={quality === opt.value ? "default" : "outline"}
                  onClick={() => handleScore(opt.value)}
                  disabled={submitting}
                  className="flex flex-col h-auto py-3 gap-0.5"
                >
                  <span className="text-lg font-bold">{opt.value}</span>
                  <span className="text-xs">{opt.label}</span>
                  <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {step === "result" && result && (
        <Card variant="pro">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <CardTitle>Review Complete</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Next review in <span className="font-bold text-foreground">{result.interval} day{result.interval !== 1 ? "s" : ""}</span>
            </p>
            <div className="flex justify-end">
              <Button onClick={handleFinish}>Continue</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
