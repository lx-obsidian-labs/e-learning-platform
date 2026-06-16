import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getAnalyticsSummary, getXpHistory, getActivityHistory, getCourseAnalytics, getWeakSpots, getWeeklyActivity } from "@/actions/analytics"
import { StatsOverview } from "@/components/analytics/stats-overview"
import { XpChart } from "@/components/analytics/xp-chart"
import { ActivityCalendar } from "@/components/analytics/activity-calendar"
import { CourseProgressList } from "@/components/analytics/course-progress"
import { WeakSpotsSection } from "@/components/analytics/weak-spots"
import { WeeklyChart } from "@/components/analytics/weekly-chart"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Analytics - Edu Learn",
}

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const summary = await getAnalyticsSummary()
  const xpHistory = await getXpHistory(30)
  const activity = await getActivityHistory(70)
  const courses = await getCourseAnalytics()
  const weakSpots = await getWeakSpots()
  const weekly = await getWeeklyActivity()

  return (
    <div className="min-h-screen pt-16 sm:pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="lead">Track your learning performance and progress</p>
          </div>
        </div>

        <StatsOverview summary={summary} />

        <div className="grid gap-6 lg:grid-cols-2">
          <XpChart data={xpHistory} />
          <WeeklyChart data={weekly} />
        </div>

        <ActivityCalendar data={activity} />

        <CourseProgressList courses={courses} />

        {weakSpots.length > 0 && <WeakSpotsSection spots={weakSpots} />}
      </div>
    </div>
  )
}
