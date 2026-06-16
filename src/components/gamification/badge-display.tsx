"use client"

import { cn } from "@/lib/utils"

const BADGE_CATALOG: Record<string, { name: string; description: string; icon: string; category: string }> = {
  badge_first_lesson: { name: "First Steps", description: "Complete your first lesson", icon: "🎯", category: "milestone" },
  badge_ten_lessons: { name: "Dedicated Learner", description: "Complete 10 lessons", icon: "📚", category: "milestone" },
  badge_fifty_lessons: { name: "Bookworm", description: "Complete 50 lessons", icon: "📖", category: "milestone" },
  badge_hundred_lessons: { name: "Scholar", description: "Complete 100 lessons", icon: "🎓", category: "milestone" },
  badge_first_course: { name: "Course Graduate", description: "Complete your first course", icon: "🏆", category: "milestone" },
  badge_streak_3: { name: "Consistent", description: "3-day learning streak", icon: "🔥", category: "streak" },
  badge_streak_7: { name: "Committed", description: "7-day learning streak", icon: "🔥", category: "streak" },
  badge_streak_30: { name: "Unstoppable", description: "30-day learning streak", icon: "💪", category: "streak" },
  badge_streak_100: { name: "Legendary", description: "100-day learning streak", icon: "👑", category: "streak" },
  badge_quiz_master: { name: "Quiz Master", description: "Score 100% on 5 quizzes", icon: "🧠", category: "achievement" },
  badge_fast_learner: { name: "Fast Learner", description: "Complete a module in under 1 hour", icon: "⚡", category: "achievement" },
  badge_helper: { name: "Community Helper", description: "Post 10 helpful comments", icon: "💬", category: "social" },
  badge_top_reviewer: { name: "Top Reviewer", description: "Write 5 course reviews", icon: "✍️", category: "social" },
}

const CATEGORY_LABELS: Record<string, string> = {
  milestone: "Milestones",
  streak: "Streaks",
  achievement: "Achievements",
  social: "Social",
}

const CATEGORY_ORDER = ["milestone", "streak", "achievement", "social"]

interface BadgeDisplayProps {
  badgeIds: string[]
  className?: string
}

export function BadgeDisplay({ badgeIds, className }: BadgeDisplayProps) {
  const earned = new Set(badgeIds)

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    badges: Object.entries(BADGE_CATALOG)
      .filter(([, v]) => v.category === cat)
      .map(([id, info]) => ({ id, ...info, earned: earned.has(id) })),
  })).filter((g) => g.badges.length > 0)

  return (
    <div className={cn("space-y-6", className)}>
      {grouped.map((group) => (
        <div key={group.category}>
          <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
            {group.label}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {group.badges.map((badge) => (
              <div
                key={badge.id}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-300",
                  badge.earned
                    ? "bg-card border-border hover:ring-1 hover:ring-indigo-500/30"
                    : "bg-muted/30 border-muted opacity-50 grayscale"
                )}
              >
                <span className="text-2xl">{badge.icon}</span>
                <span
                  className={cn(
                    "text-xs font-medium leading-tight",
                    badge.earned ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {badge.name}
                </span>
                <span className="text-[10px] text-muted-foreground/70 leading-tight line-clamp-2">
                  {badge.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
