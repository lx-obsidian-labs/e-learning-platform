"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  generateCourseOutline,
  generateLessonContent,
  generateQuiz,
  generateImagePrompt,
} from "@/actions/content-generator"
import { createCourseFromAI } from "@/actions/courses"
import {
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronRight,
  BookOpen,
  FileText,
  HelpCircle,
  Save,
  CheckCircle2,
} from "lucide-react"

type CourseOutline = {
  title: string
  description: string
  modules: {
    title: string
    description: string
    lessons: { title: string; description: string; duration: number }[]
  }[]
}

type LessonContent = {
  moduleIndex: number
  lessonIndex: number
  content: string
}

type QuizData = {
  moduleIndex: number
  lessonIndex: number
  questions: {
    text: string
    type: string
    points: number
    options: { text: string; isCorrect: boolean }[]
  }[]
}

type Step = "input" | "review" | "content" | "save"

export function AiCourseGenerator() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("input")
  const [prompt, setPrompt] = useState("")
  const [category, setCategory] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingLabel, setLoadingLabel] = useState("")
  const [outline, setOutline] = useState<CourseOutline | null>(null)
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([0]))
  const [contents, setContents] = useState<LessonContent[]>([])
  const [quizzes, setQuizzes] = useState<QuizData[]>([])
  const [generatingFor, setGeneratingFor] = useState<{ mi: number; li: number } | null>(null)
  const [generatingQuizFor, setGeneratingQuizFor] = useState<{ mi: number; li: number } | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const toggleModule = (idx: number) => {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const handleGenerateOutline = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setLoadingLabel("AI is generating your course...")
    setError("")
    try {
      const result = await generateCourseOutline(prompt.trim(), category || undefined)
      if (result.title) {
        setOutline(result)
        setStep("review")
      } else {
        setError("Failed to generate outline. Please try again.")
      }
    } catch (e) {
      setError("An error occurred while generating. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getLessonContent = (mi: number, li: number) => {
    return contents.find((c) => c.moduleIndex === mi && c.lessonIndex === li)
  }

  const getLessonQuiz = (mi: number, li: number) => {
    return quizzes.find((q) => q.moduleIndex === mi && q.lessonIndex === li)
  }

  const handleGenerateLessonContent = async (mi: number, li: number) => {
    if (!outline) return
    const lesson = outline.modules[mi]?.lessons[li]
    if (!lesson) return

    setGeneratingFor({ mi, li })
    setError("")
    try {
      const result = await generateLessonContent(
        lesson.title,
        `${outline.title}: ${outline.modules[mi].title}`
      )
      setContents((prev) => {
        const filtered = prev.filter(
          (c) => !(c.moduleIndex === mi && c.lessonIndex === li)
        )
        return [...filtered, { moduleIndex: mi, lessonIndex: li, content: result.content }]
      })
      if (!getLessonQuiz(mi, li) && result.content) {
        handleGenerateQuiz(mi, li, result.content)
      }
    } catch {
      setError("Failed to generate lesson content.")
    } finally {
      setGeneratingFor(null)
    }
  }

  const handleGenerateQuiz = async (mi: number, li: number, existingContent?: string) => {
    if (!outline) return
    const lesson = outline.modules[mi]?.lessons[li]
    if (!lesson) return

    const content = existingContent || getLessonContent(mi, li)?.content
    if (!content) return

    setGeneratingQuizFor({ mi, li })
    try {
      const result = await generateQuiz(lesson.title, content)
      if (result.questions.length > 0) {
        setQuizzes((prev) => {
          const filtered = prev.filter(
            (q) => !(q.moduleIndex === mi && q.lessonIndex === li)
          )
          return [...filtered, { moduleIndex: mi, lessonIndex: li, questions: result.questions }]
        })
      }
    } catch {
      // silently fail for quiz
    } finally {
      setGeneratingQuizFor(null)
    }
  }

  const handleSaveDraft = async () => {
    if (!outline) return
    setSaving(true)
    setError("")
    try {
      const result = await createCourseFromAI({
        title: outline.title,
        description: outline.description,
        modules: outline.modules.map((mod, mi) => ({
          title: mod.title,
          description: mod.description,
          lessons: mod.lessons.map((lesson, li) => {
            const content = getLessonContent(mi, li)
            const quiz = getLessonQuiz(mi, li)
            return {
              title: lesson.title,
              description: lesson.description,
              duration: lesson.duration,
              content: content?.content || null,
              quiz: quiz || undefined,
            }
          }),
        })),
      })
      if (result.courseId) {
        setStep("save")
      } else {
        setError(result.error || "Failed to save course")
      }
    } catch {
      setError("Failed to save course draft")
    } finally {
      setSaving(false)
    }
  }

  if (step === "save" && outline) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card variant="pro">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">Course Saved as Draft</h2>
            <p className="text-muted-foreground max-w-md">
              &quot;{outline.title}&quot; has been created and saved as a draft. You can now add more details and publish it.
            </p>
            <div className="flex gap-3 mt-4">
              <Button asChild>
                <a href="/instructor/courses">Go to My Courses</a>
              </Button>
              <Button variant="outline" onClick={() => { setStep("input"); setOutline(null); setContents([]); setQuizzes([]); setPrompt("") }}>
                Create Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {(["input", "review", "content", "save"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium ${
                step === s
                  ? "bg-primary text-primary-foreground"
                  : ["input", "review", "content"].indexOf(step) >= i
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            <span className={`text-sm hidden sm:inline ${step === s ? "font-medium" : "text-muted-foreground"}`}>
              {s === "input" ? "Describe" : s === "review" ? "Review" : s === "content" ? "Generate" : "Save"}
            </span>
            {i < 3 && <div className="h-px w-6 bg-border" />}
          </div>
        ))}
      </div>

      {/* Error display */}
      {error && (
        <Card variant="pro" className="border-destructive/50">
          <CardContent className="py-3 text-destructive text-sm">{error}</CardContent>
        </Card>
      )}

      {/* Step 1: Input prompt */}
      {step === "input" && (
        <Card variant="pro">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              AI Course Generator
            </CardTitle>
            <CardDescription>
              Describe the course you want to create. The AI will generate a complete outline with modules and lessons.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Course Description</label>
              <Textarea
                placeholder="e.g. A comprehensive course on React.js for beginners covering hooks, state management, routing, and testing..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category (optional)</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web-development">Web Development</SelectItem>
                  <SelectItem value="data-science">Data Science</SelectItem>
                  <SelectItem value="mobile-development">Mobile Development</SelectItem>
                  <SelectItem value="devops">DevOps</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGenerateOutline} disabled={loading || !prompt.trim()} className="w-full sm:w-auto">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {loadingLabel}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Course Outline
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 2: Review outline */}
      {step === "review" && outline && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">{outline.title}</h2>
              <p className="text-muted-foreground mt-1">{outline.description}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("input")}>
                Regenerate
              </Button>
              <Button onClick={() => setStep("content")}>
                Continue
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {outline.modules.map((mod, mi) => (
              <Card key={mi} variant="pro">
                <button
                  className="w-full text-left"
                  onClick={() => toggleModule(mi)}
                >
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      {expandedModules.has(mi) ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div>
                        <CardTitle className="text-base">
                          <Badge variant="outline" className="mr-2 text-xs">
                            Module {mi + 1}
                          </Badge>
                          {mod.title}
                        </CardTitle>
                        {mod.description && (
                          <CardDescription className="mt-1">{mod.description}</CardDescription>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {mod.lessons.length} lesson{mod.lessons.length !== 1 ? "s" : ""}
                    </Badge>
                  </CardHeader>
                </button>
                {expandedModules.has(mi) && (
                  <CardContent>
                    <div className="space-y-2 pl-6 border-l-2 border-muted">
                      {mod.lessons.map((lesson, li) => (
                        <div key={li} className="flex items-start gap-3 py-1">
                          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-xs font-medium">{li + 1}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{lesson.title}</p>
                            <p className="text-xs text-muted-foreground">{lesson.description}</p>
                          </div>
                          <Badge variant="outline" className="shrink-0 text-xs">
                            {lesson.duration}min
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Generate content & quizzes */}
      {step === "content" && outline && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">{outline.title}</h2>
              <p className="text-muted-foreground text-sm">
                Generate lesson content and quizzes for each lesson
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("review")}>
                Back
              </Button>
              <Button onClick={handleSaveDraft} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save as Draft
                  </>
                )}
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              {outline.modules.map((mod, mi) => (
                <div key={mi}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    Module {mi + 1}: {mod.title}
                  </h3>
                  <div className="space-y-4">
                    {mod.lessons.map((lesson, li) => {
                      const hasContent = !!getLessonContent(mi, li)
                      const quiz = getLessonQuiz(mi, li)
                      const isLoading = generatingFor?.mi === mi && generatingFor?.li === li
                      const isQuizLoading = generatingQuizFor?.mi === mi && generatingQuizFor?.li === li

                      return (
                        <Card key={li} variant="pro">
                          <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <CardTitle className="text-sm flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                  {lesson.title}
                                </CardTitle>
                                <CardDescription className="text-xs mt-1">
                                  {lesson.description}
                                </CardDescription>
                              </div>
                              <div className="flex gap-2 shrink-0">
                                <Button
                                  size="sm"
                                  variant={hasContent ? "outline" : "default"}
                                  onClick={() => handleGenerateLessonContent(mi, li)}
                                  disabled={isLoading}
                                >
                                  {isLoading ? (
                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                  ) : (
                                    <Sparkles className="h-3 w-3 mr-1" />
                                  )}
                                  {hasContent ? "Regenerate" : "Generate"} Content
                                </Button>
                              </div>
                            </div>
                          </CardHeader>

                          {/* Lesson content preview */}
                          {hasContent && (
                            <CardContent>
                              <div className="rounded-lg border bg-muted/30 p-4">
                                <div
                                  className="prose prose-sm max-w-none dark:prose-invert"
                                  dangerouslySetInnerHTML={{
                                    __html: getLessonContent(mi, li)?.content || "",
                                  }}
                                />
                              </div>
                            </CardContent>
                          )}

                          {/* Quiz section */}
                          {hasContent && (
                            <CardFooter className="flex-col items-start gap-3">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">
                                    {quiz ? `Quiz (${quiz.questions.length} questions)` : "Quiz"}
                                  </span>
                                  {quiz && (
                                    <Badge variant="secondary" className="text-xs">
                                      {quiz.questions.reduce((s, q) => s + q.points, 0)} pts
                                    </Badge>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleGenerateQuiz(mi, li)}
                                  disabled={isQuizLoading}
                                >
                                  {isQuizLoading ? (
                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                  ) : (
                                    <Sparkles className="h-3 w-3 mr-1" />
                                  )}
                                  {quiz ? "Regenerate Quiz" : "Generate Quiz"}
                                </Button>
                              </div>

                              {/* Quiz preview */}
                              {quiz && (
                                <div className="w-full space-y-3">
                                  {quiz.questions.map((q, qi) => (
                                    <div key={qi} className="rounded-lg border p-3 text-sm">
                                      <p className="font-medium mb-2">
                                        {qi + 1}. {q.text}{" "}
                                        <Badge variant="outline" className="text-[10px] ml-1">
                                          {q.points}pt
                                        </Badge>
                                      </p>
                                      <div className="space-y-1 pl-4">
                                        {q.options.map((opt, oi) => (
                                          <div
                                            key={oi}
                                            className={`flex items-center gap-2 text-xs ${
                                              opt.isCorrect ? "text-green-600 font-medium" : "text-muted-foreground"
                                            }`}
                                          >
                                            {opt.isCorrect ? (
                                              <CheckCircle2 className="h-3 w-3 shrink-0" />
                                            ) : (
                                              <div className="h-3 w-3 rounded-full border shrink-0" />
                                            )}
                                            {opt.text}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardFooter>
                          )}
                        </Card>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setStep("review")}>
              Back to Outline
            </Button>
            <Button onClick={handleSaveDraft} disabled={saving} size="lg">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save as Draft
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
