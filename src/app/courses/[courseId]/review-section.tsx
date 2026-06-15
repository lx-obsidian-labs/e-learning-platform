"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { submitReview } from "@/actions/reviews"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"

type Review = {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  user: { name: string | null; image: string | null }
  isOwn?: boolean
}

type Props = {
  courseId: string
  courseSlug: string
  reviews: Review[]
  canReview: boolean
  userReview?: Review | null
}

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-2xl transition-colors ${
            star <= value ? "text-yellow-500" : "text-muted-foreground/30"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-sm ${
            star <= rating ? "text-yellow-500" : "text-muted-foreground/30"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  )
}

export function ReviewSection({ courseId, courseSlug, reviews, canReview, userReview }: Props) {
  const router = useRouter()
  const [rating, setRating] = useState(userReview?.rating ?? 0)
  const [comment, setComment] = useState(userReview?.comment ?? "")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) return
    setSubmitting(true)
    const fd = new FormData()
    fd.set("rating", String(rating))
    fd.set("comment", comment)
    const result = await submitReview(courseId, courseSlug, fd)
    if (result.success) {
      toast.success(userReview ? "Review updated" : "Review submitted")
      router.refresh()
    } else {
      toast.error(typeof result.error === "string" ? result.error : "Failed to submit")
    }
    setSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Reviews ({reviews.length})
            <span className="text-muted-foreground font-normal ml-2">
              {reviews.length > 0 && (
                <>
                  — {reviews.reduce((s, r) => s + r.rating, 0) / reviews.length}/5
                </>
              )}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {canReview && (
            <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border p-4">
              <StarInput value={rating} onChange={setRating} />
              <Textarea
                placeholder="Share your experience (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
              <Button type="submit" disabled={submitting || rating === 0}>
                {submitting ? "Submitting..." : userReview ? "Update Review" : "Submit Review"}
              </Button>
            </form>
          )}

          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={review.user.image ?? undefined} />
                    <AvatarFallback className="text-xs">
                      {review.user.name?.[0] ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {review.user.name ?? "Anonymous"}
                    {review.isOwn && (
                      <span className="text-muted-foreground ml-1">(you)</span>
                    )}
                  </span>
                  <StarDisplay rating={review.rating} />
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground ml-8">{review.comment}</p>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
