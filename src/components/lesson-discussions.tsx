"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createDiscussion } from "@/actions/discussions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

type Reply = {
  id: string
  content: string
  createdAt: string
  user: { id: string; name: string | null; image: string | null }
}

type Discussion = {
  id: string
  content: string
  createdAt: string
  user: { id: string; name: string | null; image: string | null }
  replies: Reply[]
}

type Props = {
  lessonId: string
  discussions: Discussion[]
  userId: string
}

function ReplyForm({
  lessonId,
  parentId,
  onDone,
}: {
  lessonId: string
  parentId: string
  onDone: () => void
}) {
  const [content, setContent] = useState("")
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setSending(true)
    const fd = new FormData()
    fd.set("content", content)
    fd.set("parentId", parentId)
    const result = await createDiscussion(lessonId, fd)
    if (result.success) {
      toast.success("Reply posted")
      setContent("")
      setOpen(false)
      onDone()
    } else {
      toast.error(result.error ?? "Failed to reply")
    }
    setSending(false)
  }

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={() => setOpen(!open)}>
        {open ? "Cancel" : "Reply"}
      </Button>
      {open && (
        <form onSubmit={handleSubmit} className="mt-2 space-y-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a reply..."
            rows={2}
          />
          <Button type="submit" size="sm" disabled={sending || !content.trim()}>
            {sending ? "Posting..." : "Post Reply"}
          </Button>
        </form>
      )}
    </div>
  )
}

export function LessonDiscussions({ lessonId, discussions, userId }: Props) {
  const router = useRouter()
  const [newComment, setNewComment] = useState("")
  const [sending, setSending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newComment.trim()) return
    setSending(true)
    const fd = new FormData()
    fd.set("content", newComment)
    const result = await createDiscussion(lessonId, fd)
    if (result.success) {
      toast.success("Comment posted")
      setNewComment("")
      router.refresh()
    } else {
      toast.error(result.error ?? "Failed to post")
    }
    setSending(false)
  }

  return (
    <Card variant="pro">
      <CardHeader>
        <CardTitle>Discussions ({discussions.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ask a question or share your thoughts..."
            rows={3}
          />
          <Button type="submit" disabled={sending || !newComment.trim()}>
            {sending ? "Posting..." : "Post Comment"}
          </Button>
        </form>

        <Separator />

        {discussions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No discussions yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {discussions.map((disc) => (
              <div key={disc.id}>
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 mt-0.5">
                    <AvatarImage src={disc.user.image ?? undefined} />
                    <AvatarFallback>{disc.user.name?.[0] ?? "?"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{disc.user.name ?? "Anonymous"}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(disc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{disc.content}</p>
                    <ReplyForm lessonId={lessonId} parentId={disc.id} onDone={() => router.refresh()} />

                    {disc.replies.length > 0 && (
                      <div className="mt-3 space-y-3 border-l-2 pl-4">
                        {disc.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-2">
                            <Avatar className="h-6 w-6 mt-0.5">
                              <AvatarImage src={reply.user.image ?? undefined} />
                              <AvatarFallback className="text-xs">
                                {reply.user.name?.[0] ?? "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium">{reply.user.name ?? "Anonymous"}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(reply.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <Separator className="mt-4" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
