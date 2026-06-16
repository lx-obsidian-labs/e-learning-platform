import { notFound, redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { ReviewSession } from "@/components/gamification/review-session"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ itemId: string }> }) {
  return { title: "Review - Edu Learn" }
}

export default async function ReviewItemPage({ params }: { params: Promise<{ itemId: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { itemId } = await params

  const admin = createAdminClient()

  const { data: reviewItem } = await admin
    .from("review_items")
    .select("*, lesson:lessonId(*)")
    .eq('"id"', itemId)
    .eq('"userId"', user.id)
    .maybeSingle()

  if (!reviewItem) {
    notFound()
  }

  const lesson = reviewItem.lesson

  if (!lesson) {
    notFound()
  }

  return (
    <div className="min-h-screen pt-16 sm:pt-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <ReviewSession
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          lessonContent={lesson.content || ""}
          onComplete={async () => {
            "use server"
            redirect("/review")
          }}
        />
      </div>
    </div>
  )
}
