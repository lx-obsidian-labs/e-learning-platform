import { getMyStats } from "@/actions/gamification"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BadgeDisplay } from "@/components/gamification/badge-display"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Badges - Edu Learn",
}

export const dynamic = "force-dynamic"

export default async function BadgesPage() {
  const stats = await getMyStats()

  return (
    <div className="min-h-screen pt-16 sm:pt-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Your Badges</h1>
          <p className="text-muted-foreground mt-1">
            Earn badges by completing lessons, maintaining streaks, acing quizzes, and more. Keep learning to unlock them all!
          </p>
        </div>

        {stats && stats.badges.length > 0 && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>🏅 <strong>{stats.badges.length}</strong> of 13 badges earned</span>
          </div>
        )}

        <Card variant="pro">
          <CardHeader>
            <CardTitle>Badge Catalog</CardTitle>
          </CardHeader>
          <CardContent>
            <BadgeDisplay badgeIds={stats?.badges || []} />
          </CardContent>
        </Card>

        {(!stats || stats.badges.length === 0) && (
          <div className="text-center py-16 text-muted-foreground">
            No badges yet. Start learning to earn your first badge!
          </div>
        )}
      </div>
    </div>
  )
}
