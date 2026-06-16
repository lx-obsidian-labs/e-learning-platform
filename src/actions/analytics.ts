"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getCurrentUserWithRole } from "@/actions/auth"
import { randomUUID } from "crypto"

export interface AnalyticsSummary {
  totalXp: number
  level: number
  xpForNext: number
  currentStreak: number
  longestStreak: number
  totalLessonsCompleted: number
  coursesEnrolled: number
  coursesCompleted: number
  avgQuizScore: number
  totalReviews: number
  reviewAccuracy: number
  badgesEarned: number
}

export interface DailyXp {
  date: string
  xp: number
}

export interface ActivityDay {
  date: string
  count: number
}

export interface CourseAnalytics {
  courseId: string
  title: string
  slug: string
  progress: number
  totalLessons: number
  completedLessons: number
  status: string
}

export interface WeakSpot {
  lessonId: string
  title: string
  easiness: number
  interval: number
  moduleTitle: string
}

const admin = createAdminClient()

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 1750, 2800, 4200, 6000, 8500, 11500, 15000, 19000, 24000, 30000, 37000, 45000, 54000, 64000, 75000]

export async function getAnalyticsSummary(): Promise<AnalyticsSummary | null> {
  try {
    const user = await getCurrentUserWithRole()
    if (!user) return null

    const { data: levelData } = await admin
      .from("user_levels").select("*").eq('"userId"', user.id).maybeSingle()

    const { data: streakData } = await admin
      .from("streaks").select("*").eq('"userId"', user.id).maybeSingle()

    const { count: lessonCount } = await admin
      .from("lesson_completions").select("*", { count: "exact", head: true }).eq('"userId"', user.id)

    const { data: enrollments } = await admin
      .from("enrollments").select("*").eq('"userId"', user.id)

    const enrolled = (enrollments || []).length
    const completed = (enrollments || []).filter((e: any) => e.status === "COMPLETED").length

    const { data: reviewSessions } = await admin
      .from("review_sessions").select("score").eq('"userId"', user.id)

    const totalReviews = (reviewSessions || []).length
    const avgScore = totalReviews > 0
      ? Math.round((reviewSessions || []).reduce((s: number, r: any) => s + r.score, 0) / totalReviews * 20)
      : 0

    const { count: badgeCount } = await admin
      .from("user_badges").select("*", { count: "exact", head: true }).eq('"userId"', user.id)

    const level = levelData?.level || 1
    const xpForNext = level < LEVEL_THRESHOLDS.length ? LEVEL_THRESHOLDS[level] : 0

    return {
      totalXp: levelData?.xp || 0,
      level,
      xpForNext,
      currentStreak: streakData?.currentStreak || 0,
      longestStreak: streakData?.longestStreak || 0,
      totalLessonsCompleted: lessonCount || 0,
      coursesEnrolled: enrolled,
      coursesCompleted: completed,
      avgQuizScore: avgScore,
      totalReviews,
      reviewAccuracy: avgScore,
      badgesEarned: badgeCount || 0,
    }
  } catch {
    return null
  }
}

export async function getXpHistory(days: number = 30): Promise<DailyXp[]> {
  try {
    const user = await getCurrentUserWithRole()
    if (!user) return []

    const since = new Date(Date.now() - days * 86400000).toISOString()

    const { data: transactions } = await admin
      .from("xp_transactions")
      .select("amount, createdAt")
      .eq('"userId"', user.id)
      .gte('"createdAt"', since)
      .order('"createdAt"', { ascending: true })

    const dailyMap: Record<string, number> = {}
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().split("T")[0]
      dailyMap[d] = 0
    }

    for (const tx of (transactions || [])) {
      const date = new Date(tx.createdAt).toISOString().split("T")[0]
      if (dailyMap[date] !== undefined) {
        dailyMap[date] += tx.amount
      }
    }

    return Object.entries(dailyMap).map(([date, xp]) => ({ date, xp }))
  } catch {
    return []
  }
}

export async function getActivityHistory(days: number = 70): Promise<ActivityDay[]> {
  try {
    const user = await getCurrentUserWithRole()
    if (!user) return []

    const since = new Date(Date.now() - days * 86400000).toISOString()

    const { data: completions } = await admin
      .from("lesson_completions")
      .select("completedAt")
      .eq('"userId"', user.id)
      .gte('"completedAt"', since)

    const dailyMap: Record<string, number> = {}
    for (let i = days - 1; i >= 0; i--) {
      dailyMap[new Date(Date.now() - i * 86400000).toISOString().split("T")[0]] = 0
    }

    for (const c of (completions || [])) {
      const date = new Date(c.completedAt).toISOString().split("T")[0]
      if (dailyMap[date] !== undefined) dailyMap[date]++
    }

    return Object.entries(dailyMap).map(([date, count]) => ({ date, count }))
  } catch {
    return []
  }
}

export async function getCourseAnalytics(): Promise<CourseAnalytics[]> {
  try {
    const user = await getCurrentUserWithRole()
    if (!user) return []

    const { data: enrollments } = await admin
      .from("enrollments").select("*").eq('"userId"', user.id)

    const results: CourseAnalytics[] = []
    for (const enrollment of (enrollments || [])) {
      const { data: course } = await admin
        .from("courses").select("title, slug").eq('"id"', enrollment.courseId).single()
      if (!course) continue

      const { data: modules } = await admin
        .from("modules").select("id").eq('"courseId"', enrollment.courseId)
      const moduleIds = (modules || []).map((m: any) => m.id)

      let totalLessons = 0
      if (moduleIds.length > 0) {
        const { count } = await admin
          .from("lessons").select("*", { count: "exact", head: true }).in('"moduleId"', moduleIds)
        totalLessons = count || 0
      }

      const { data: lessonData } = await admin
        .from("lessons").select("id").in('"moduleId"', moduleIds)
      const lessonIds = (lessonData || []).map((l: any) => l.id)

      const { count: completedLessons } = lessonIds.length > 0 ? await admin
        .from("lesson_completions").select("*", { count: "exact", head: true })
        .eq('"userId"', user.id)
        .in('"lessonId"', lessonIds) : { count: 0 }

      results.push({
        courseId: enrollment.courseId,
        title: course.title,
        slug: course.slug,
        progress: enrollment.progress || 0,
        totalLessons,
        completedLessons: completedLessons || 0,
        status: enrollment.status || "NOT_STARTED",
      })
    }

    return results
  } catch {
    return []
  }
}

export async function getWeakSpots(): Promise<WeakSpot[]> {
  try {
    const user = await getCurrentUserWithRole()
    if (!user) return []

    const { data: items } = await admin
      .from("review_items")
      .select("lessonId, easiness, interval, lesson:lessonId(id, title, moduleId, module:moduleId(title))")
      .eq('"userId"', user.id)
      .order('"easiness"', { ascending: true })
      .limit(10)

    return (items || [])
      .filter((i: any) => i.lesson)
      .map((i: any) => ({
        lessonId: i.lessonId,
        title: i.lesson?.title || "Unknown",
        easiness: i.easiness,
        interval: i.interval,
        moduleTitle: i.lesson?.module?.title || "",
      }))
  } catch {
    return []
  }
}

export async function getWeeklyActivity(): Promise<{ day: string; hours: number }[]> {
  try {
    const user = await getCurrentUserWithRole()
    if (!user) return []

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()

    const { data: completions } = await admin
      .from("lesson_completions")
      .select("completedAt")
      .eq('"userId"', user.id)
      .gte('"completedAt"', weekAgo)

    const dailyCount: Record<string, number> = {}
    for (let i = 0; i < 7; i++) {
      const d = new Date(Date.now() - (6 - i) * 86400000).toISOString().split("T")[0]
      dailyCount[d] = 0
    }

    for (const c of (completions || [])) {
      const date = new Date(c.completedAt).toISOString().split("T")[0]
      if (dailyCount[date] !== undefined) dailyCount[date]++
    }

    return Object.entries(dailyCount).map(([date, count], idx) => ({
      day: dayNames[new Date(date).getDay()],
      hours: count,
    }))
  } catch {
    return []
  }
}
