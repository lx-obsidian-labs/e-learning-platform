"use client"

import { StatCard } from "@/components/dashboard/stat-card"
import { Award, Flame, BookOpen, CheckCircle, Brain, Target } from "lucide-react"
import type { AnalyticsSummary } from "@/actions/analytics"

interface StatsOverviewProps {
  summary: AnalyticsSummary | null
}

export function StatsOverview({ summary }: StatsOverviewProps) {
  if (!summary) {
    return (
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard
        title={`Level ${summary.level}`}
        value={`${summary.totalXp} XP`}
        description={`${summary.xpForNext} XP to next level`}
        icon={Award}
        className="border-l-indigo-500"
        iconClassName="bg-indigo-100 text-indigo-600"
      />
      <StatCard
        title="Streak"
        value={`${summary.currentStreak} days`}
        description={`Longest: ${summary.longestStreak}`}
        icon={Flame}
        className="border-l-orange-500"
        iconClassName="bg-orange-100 text-orange-600"
      />
      <StatCard
        title="Lessons Completed"
        value={summary.totalLessonsCompleted}
        icon={BookOpen}
        className="border-l-blue-500"
        iconClassName="bg-blue-100 text-blue-600"
      />
      <StatCard
        title="Courses Completed"
        value={`${summary.coursesCompleted} / ${summary.coursesEnrolled}`}
        description="Enrolled / Completed"
        icon={CheckCircle}
        className="border-l-green-500"
        iconClassName="bg-green-100 text-green-600"
      />
      <StatCard
        title="Review Accuracy"
        value={`${summary.reviewAccuracy}%`}
        description={`${summary.totalReviews} reviews done`}
        icon={Brain}
        className="border-l-purple-500"
        iconClassName="bg-purple-100 text-purple-600"
      />
      <StatCard
        title="Badges Earned"
        value={summary.badgesEarned}
        icon={Target}
        className="border-l-rose-500"
        iconClassName="bg-rose-100 text-rose-600"
      />
    </div>
  )
}
