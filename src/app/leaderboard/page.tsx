import Link from "next/link"
import { getXpLeaderboard } from "@/actions/gamification"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const MEDALS = ["🥇", "🥈", "🥉"]

export const dynamic = "force-dynamic"

export default async function LeaderboardPage() {
  const leaderboard = await getXpLeaderboard()

  return (
    <div className="min-h-screen pt-16 sm:pt-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground mt-1">Top learners ranked by XP and level</p>
        </div>

        <Card variant="pro">
          <CardHeader>
            <CardTitle>Top Learners</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {leaderboard.map((entry) => {
                const initials = (entry.name || "?")
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()

                const isTop3 = entry.rank <= 3

                return (
                  <div
                    key={entry.userId}
                    className={cn(
                      "flex items-center gap-4 px-4 sm:px-6 py-4 transition-colors hover:bg-muted/50",
                      isTop3 && "bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/10"
                    )}
                  >
                    <div className="flex items-center justify-center w-8 h-8 shrink-0">
                      {isTop3 ? (
                        <span className="text-xl">{MEDALS[entry.rank - 1]}</span>
                      ) : (
                        <span className="text-sm font-semibold text-muted-foreground tabular-nums">
                          #{entry.rank}
                        </span>
                      )}
                    </div>

                    <Avatar className="h-9 w-9 ring-2 ring-indigo-200 dark:ring-indigo-800 shrink-0">
                      {entry.image ? <AvatarImage src={entry.image} alt={entry.name} /> : null}
                      <AvatarFallback className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{entry.name}</p>
                      <p className="text-xs text-muted-foreground">Level {entry.level}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold tabular-nums">{entry.xp.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">XP</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {leaderboard.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            No learners on the leaderboard yet. Start learning to be the first!
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/badges" className="text-sm text-primary hover:underline">
            View all badges →
          </Link>
        </div>
      </div>
    </div>
  )
}
