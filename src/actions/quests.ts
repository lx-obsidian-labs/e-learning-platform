"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getCurrentUserWithRole } from "@/actions/auth"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"
import { awardXp } from "@/actions/gamification"

function getTodayDate() {
  return new Date().toISOString().split("T")[0]
}

export async function generateDailyQuests() {
  const user = await getCurrentUserWithRole()
  if (!user) return { error: "Not authenticated" }

  const supabase = createAdminClient()
  const today = getTodayDate()

  const { data: existing } = await supabase
    .from("user_quests")
    .select("id")
    .eq('"userId"', user.id)
    .eq('"date"', today)

  if (existing && existing.length > 0) {
    return getActiveQuests()
  }

  const { data: allQuests } = await supabase
    .from("quests")
    .select("*")

  if (!allQuests || allQuests.length === 0) return []

  const shuffled = [...allQuests].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, 3)

  const inserts = selected.map((quest) => ({
    id: randomUUID(),
    userId: user.id,
    questId: quest.id,
    progress: 0,
    completed: false,
    claimed: false,
    date: today,
  }))

  const { error } = await supabase.from("user_quests").insert(inserts)
  if (error) return { error: error.message }

  revalidatePath("/dashboard")
  return getActiveQuests()
}

export async function getActiveQuests() {
  const user = await getCurrentUserWithRole()
  if (!user) return []

  const supabase = createAdminClient()
  const today = getTodayDate()

  const { data: userQuests } = await supabase
    .from("user_quests")
    .select("*, quest:questId(*)")
    .eq('"userId"', user.id)
    .eq('"date"', today)

  if (!userQuests) return []

  return userQuests.map((uq: any) => ({
    id: uq.id,
    userId: uq.userId,
    questId: uq.questId,
    progress: uq.progress,
    completed: uq.completed,
    claimed: uq.claimed,
    date: uq.date,
    title: uq.quest?.title || "",
    description: uq.quest?.description || "",
    xpReward: uq.quest?.xpReward || 0,
    icon: uq.quest?.icon || "🎯",
    requirementType: uq.quest?.requirementType || "",
    requirementCount: uq.quest?.requirementCount || 1,
  }))
}

export async function updateQuestProgress(requirementType: string, count: number = 1) {
  const user = await getCurrentUserWithRole()
  if (!user) return null

  const supabase = createAdminClient()
  const today = getTodayDate()

  const { data: userQuests } = await supabase
    .from("user_quests")
    .select("*, quest:questId(*)")
    .eq('"userId"', user.id)
    .eq('"date"', today)

  if (!userQuests) return null

  const matching = userQuests.find((uq: any) => uq.quest?.requirementType === requirementType && !uq.completed)
  if (!matching) return null

  const newProgress = matching.progress + count
  const requirementCount = matching.quest?.requirementCount || 1
  const completed = newProgress >= requirementCount

  const { error } = await supabase
    .from("user_quests")
    .update({
      progress: newProgress,
      completed,
      updatedAt: new Date().toISOString(),
    })
    .eq('"id"', matching.id)

  if (error) return null

  revalidatePath("/dashboard")
  return {
    ...matching,
    progress: newProgress,
    completed,
    title: matching.quest?.title,
    description: matching.quest?.description,
    xpReward: matching.quest?.xpReward,
    icon: matching.quest?.icon,
    requirementType: matching.quest?.requirementType,
    requirementCount,
  }
}

export async function claimQuestReward(userQuestId: string) {
  const user = await getCurrentUserWithRole()
  if (!user) return { error: "Not authenticated" }

  const supabase = createAdminClient()

  const { data: uq } = await supabase
    .from("user_quests")
    .select("*, quest:questId(*)")
    .eq('"id"', userQuestId)
    .eq('"userId"', user.id)
    .single()

  if (!uq) return { error: "Quest not found" }
  if (!uq.completed) return { error: "Quest not completed" }
  if (uq.claimed) return { error: "Quest already claimed" }

  const { error: updateError } = await supabase
    .from("user_quests")
    .update({
      claimed: true,
      updatedAt: new Date().toISOString(),
    })
    .eq('"id"', userQuestId)

  if (updateError) return { error: updateError.message }

  const xpAmount = uq.quest?.xpReward || 50
  const result = await awardXp(user.id, xpAmount, "quest_reward", userQuestId)

  revalidatePath("/dashboard")
  return result
}
