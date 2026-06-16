"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getCurrentUserWithRole } from "@/actions/auth"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"

const XP_LESSON_COMPLETE = 25
const XP_QUIZ_PERFECT = 50
const XP_STREAK_BONUS = 10
const XP_COURSE_COMPLETE = 200

const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 1750, 2800, 4200, 6000, 8500,
  11500, 15000, 19000, 24000, 30000, 37000, 45000, 54000, 64000, 75000,
]

function getLevel(xp: number): number {
  let level = 1
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1
  }
  return level
}

function getXpForNextLevel(level: number): number {
  if (level >= LEVEL_THRESHOLDS.length) return 0
  return LEVEL_THRESHOLDS[level]
}

export async function awardXp(userId: string, amount: number, source: string, referenceId?: string) {
  const supabase = createAdminClient()

  // Insert XP transaction
  const { error: txError } = await supabase.from("xp_transactions").insert({
    id: randomUUID(),
    userId,
    amount,
    source,
    referenceId: referenceId || null,
  })
  if (txError) return { error: txError.message }

  // Upsert user_levels
  const { data: current } = await supabase
    .from("user_levels")
    .select("xp")
    .eq('"userId"', userId)
    .maybeSingle()

  const newXp = (current?.xp || 0) + amount
  const newLevel = getLevel(newXp)

  const { error: levelError } = await supabase.from("user_levels").upsert({
    userId,
    xp: newXp,
    level: newLevel,
    updatedAt: new Date().toISOString(),
  }, { onConflict: '"userId"' })

  if (levelError) return { error: levelError.message }

  // Check for level-up badges
  const newBadges: string[] = []
  for (const badgeId of ["badge_first_lesson", "badge_ten_lessons", "badge_fifty_lessons", "badge_hundred_lessons"]) {
    const badgeThreshold = badgeId === "badge_first_lesson" ? 1
      : badgeId === "badge_ten_lessons" ? 10
      : badgeId === "badge_fifty_lessons" ? 50
      : badgeId === "badge_hundred_lessons" ? 100 : 0
    if (newLevel >= badgeThreshold) {
      const { data: existing } = await supabase.from("user_badges").select("id").eq('"userId"', userId).eq('"badgeId"', badgeId).maybeSingle()
      if (!existing) {
        await supabase.from("user_badges").insert({ id: randomUUID(), userId, badgeId })
        newBadges.push(badgeId)
      }
    }
  }

  return { xp: newXp, level: newLevel, newBadges }
}

export async function awardLessonXp(lessonId: string) {
  const user = await getCurrentUserWithRole()
  if (!user) return { error: "Not authenticated" }
  return awardXp(user.id, XP_LESSON_COMPLETE, "lesson_complete", lessonId)
}

export async function awardQuizXp(quizId: string, score: number, total: number) {
  const user = await getCurrentUserWithRole()
  if (!user) return { error: "Not authenticated" }
  if (score === total) {
    return awardXp(user.id, XP_QUIZ_PERFECT, "quiz_perfect", quizId)
  }
  return { xp: 0, level: 0, newBadges: [] }
}

export async function awardCourseXp(courseId: string) {
  const user = await getCurrentUserWithRole()
  if (!user) return { error: "Not authenticated" }
  const result = await awardXp(user.id, XP_COURSE_COMPLETE, "course_complete", courseId)

  // award course graduate badge
  const supabase = createAdminClient()
  const { data: existing } = await supabase.from("user_badges").select("id").eq('"userId"', user.id).eq('"badgeId"', "badge_first_course").maybeSingle()
  if (!existing) {
    await supabase.from("user_badges").insert({ id: randomUUID(), userId: user.id, badgeId: "badge_first_course" })
    result.newBadges?.push("badge_first_course")
  }

  return result
}

export async function updateStreak() {
  const user = await getCurrentUserWithRole()
  if (!user) return { error: "Not authenticated" }

  const supabase = createAdminClient()
  const today = new Date().toISOString().split("T")[0]

  const { data: streak } = await supabase
    .from("streaks")
    .select("*")
    .eq('"userId"', user.id)
    .maybeSingle()

  if (streak) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]
    const lastDate = streak.lastActivityDate

    let currentStreak = streak.currentStreak
    if (lastDate === yesterday) {
      currentStreak += 1
    } else if (lastDate !== today) {
      currentStreak = 1
    }

    const longestStreak = Math.max(currentStreak, streak.longestStreak)

    await supabase.from("streaks").update({
      currentStreak,
      longestStreak,
      lastActivityDate: today,
      updatedAt: new Date().toISOString(),
    }).eq('"id"', streak.id)

    // Award streak badges
    const newBadges: string[] = []
    const streakBadges = [
      { id: "badge_streak_3", threshold: 3 },
      { id: "badge_streak_7", threshold: 7 },
      { id: "badge_streak_30", threshold: 30 },
      { id: "badge_streak_100", threshold: 100 },
    ]
    for (const sb of streakBadges) {
      if (currentStreak >= sb.threshold) {
        const { data: existing } = await supabase.from("user_badges").select("id").eq('"userId"', user.id).eq('"badgeId"', sb.id).maybeSingle()
        if (!existing) {
          await supabase.from("user_badges").insert({ id: randomUUID(), userId: user.id, badgeId: sb.id })
          newBadges.push(sb.id)
        }
      }
    }

    return { currentStreak, longestStreak, streakBonus: currentStreak > 1 ? XP_STREAK_BONUS : 0, newBadges }
  } else {
    await supabase.from("streaks").insert({
      id: randomUUID(),
      userId: user.id,
      currentStreak: 1,
      longestStreak: 1,
      lastActivityDate: today,
    })
    return { currentStreak: 1, longestStreak: 1, streakBonus: 0, newBadges: [] }
  }
}

export async function getLeaderboard(scope: "all" | "course" = "all", courseId?: string) {
  const supabase = createAdminClient()

  const { data: leaderboard } = await supabase
    .from("user_levels")
    .select("userId, level, xp, users:userId(name, image)")
    .order("level", { ascending: false })
    .order("xp", { ascending: false })
    .limit(50)

  return (leaderboard || []).map((entry: any, idx: number) => ({
    rank: idx + 1,
    userId: entry.userId,
    level: entry.level,
    xp: entry.xp,
    name: entry.users?.name || "Anonymous",
    image: entry.users?.image || null,
  }))
}

export async function getMyStats() {
  const user = await getCurrentUserWithRole()
  if (!user) return null

  const supabase = createAdminClient()

  const { data: levelData } = await supabase
    .from("user_levels")
    .select("*")
    .eq('"userId"', user.id)
    .maybeSingle()

  const { data: streakData } = await supabase
    .from("streaks")
    .select("*")
    .eq('"userId"', user.id)
    .maybeSingle()

  const { data: badges } = await supabase
    .from("user_badges")
    .select("badgeId, earnedAt")
    .eq('"userId"', user.id)
    .order('"earnedAt"', { ascending: false })

  return {
    level: levelData?.level || 1,
    xp: levelData?.xp || 0,
    xpForNext: getXpForNextLevel(levelData?.level || 1),
    currentStreak: streakData?.currentStreak || 0,
    longestStreak: streakData?.longestStreak || 0,
    badges: (badges || []).map((b: any) => b.badgeId),
  }
}

export async function getXpLeaderboard() {
  return getLeaderboard("all")
}
