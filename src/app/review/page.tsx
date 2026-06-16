import { getDueReviews } from "@/actions/spaced-repetition"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, CheckCircle2 } from "lucide-react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Spaced Repetition Reviews - Edu Learn",
}

export default async function ReviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const dueReviews = await getDueReviews()

  return (
    <div className="min-h-screen pt-16 sm:pt-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Brain className="h-7 w-7 text-indigo-500" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Spaced Repetition Reviews</h1>
            <p className="text-muted-foreground mt-1">Review past lesson content to reinforce your learning</p>
          </div>
        </div>

        {dueReviews.length === 0 ? (
          <Card variant="pro">
            <CardContent className="flex flex-col items-center gap-4 py-16">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="text-lg text-muted-foreground text-center">
                No reviews due! Great job keeping up.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You have {dueReviews.length} review{dueReviews.length !== 1 ? "s" : ""} due
            </p>
            {dueReviews.map((review) => (
              <Card key={review.id} variant="pro">
                <CardHeader>
                  <CardTitle>{review.title}</CardTitle>
                  {review.moduleTitle && (
                    <CardDescription>
                      {review.moduleTitle}
                      {review.courseSlug && <> &middot; <Link href={`/courses/${review.courseSlug}`} className="text-primary hover:underline">{review.courseSlug}</Link></>}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    <span>Easiness: {review.easiness.toFixed(1)}</span>
                    {review.interval > 0 && <span className="ml-3">Interval: {review.interval} days</span>}
                  </div>
                  <Button asChild size="sm">
                    <Link href={`/review/${review.id}`}>Review Now</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
