"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Send, Brain, Sparkles, X } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface AiVideoCoachProps {
  lessonId: string
  lessonTitle: string
  lessonContent?: string
  videoUrl?: string
  videoTitle?: string
}

export function AiVideoCoach({ lessonId, lessonTitle, lessonContent, videoUrl, videoTitle }: AiVideoCoachProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [open])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return
    const question = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: question }])
    setLoading(true)

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }))
      const res = await fetch("/api/ai/video-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, lessonTitle, lessonContent, videoUrl, videoTitle, question, history }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply || "Sorry, I couldn't process that." }])
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, AI coaching is unavailable right now." }])
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages, lessonId, lessonTitle, lessonContent, videoUrl, videoTitle])

  return (
    <>
      {/* Floating button over the video */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            className="absolute bottom-3 right-3 z-10 gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30 border-0 rounded-full px-3 h-9 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Ask AI Coach"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <Brain className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">AI Coach</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[400px] sm:max-w-[480px] p-0 flex flex-col">
          <SheetHeader className="px-4 py-3 border-b shrink-0">
            <SheetTitle className="flex items-center gap-2 text-sm">
              <Brain className="h-4 w-4 text-indigo-500" />
              AI Video Coach
              <span className="text-xs text-muted-foreground font-normal ml-auto">
                {videoTitle || lessonTitle}
              </span>
            </SheetTitle>
          </SheetHeader>

          {/* Messages area */}
          <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3 pt-12">
                <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Ask anything about this lesson</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Get explanations, examples, and clarifications
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    }`}
                  >
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input area */}
          <div className="border-t p-4 shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Ask about this lesson..."
                className="flex-1 min-h-[40px] max-h-[120px] resize-none rounded-xl border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                rows={1}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="h-10 w-10 rounded-full shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
