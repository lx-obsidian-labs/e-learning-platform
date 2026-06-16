"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getCurrentUserWithRole } from "@/actions/auth"
import { revalidatePath } from "next/cache"
import { randomUUID, randomBytes } from "crypto"
import type { GroupWithDetails, StudyGroup, GroupMember } from "@/types/study-groups"

function generateInviteCode(): string {
  return randomBytes(4).toString("hex")
}

export async function createGroup(data: {
  name: string
  description?: string
  courseId?: string
  maxMembers?: number
  isPublic?: boolean
}) {
  const user = await getCurrentUserWithRole()
  if (!user) return { error: "Not authenticated" }

  const supabase = createAdminClient()
  const groupId = randomUUID()

  const { error: groupError } = await supabase.from("study_groups").insert({
    id: groupId,
    name: data.name.trim(),
    description: data.description?.trim() || null,
    courseId: data.courseId || null,
    createdBy: user.id,
    maxMembers: data.maxMembers || 20,
    isPublic: data.isPublic ?? true,
    inviteCode: generateInviteCode(),
    updatedAt: new Date().toISOString(),
  })

  if (groupError) return { error: groupError.message }

  const { error: memberError } = await supabase.from("group_members").insert({
    id: randomUUID(),
    groupId,
    userId: user.id,
    role: "admin",
  })

  if (memberError) {
    await supabase.from("study_groups").delete().eq('"id"', groupId)
    return { error: memberError.message }
  }

  await supabase.from("group_activities").insert({
    id: randomUUID(),
    groupId,
    userId: user.id,
    type: "created",
    message: "created the group",
  })

  revalidatePath("/groups")
  return { groupId }
}

export async function updateGroup(
  groupId: string,
  data: { name?: string; description?: string | null; maxMembers?: number; isPublic?: boolean }
) {
  const user = await getCurrentUserWithRole()
  if (!user) return { error: "Not authenticated" }

  const supabase = createAdminClient()

  const { data: group } = await supabase
    .from("study_groups")
    .select('"createdBy"')
    .eq('"id"', groupId)
    .single()

  if (!group) return { error: "Group not found" }
  if (group.createdBy !== user.id && user.role !== "ADMIN") {
    return { error: "Not authorized" }
  }

  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() }
  if (data.name !== undefined) updates.name = data.name.trim()
  if (data.description !== undefined) updates.description = data.description
  if (data.maxMembers !== undefined) updates.maxMembers = data.maxMembers
  if (data.isPublic !== undefined) updates.isPublic = data.isPublic

  const { error } = await supabase.from("study_groups").update(updates).eq('"id"', groupId)

  if (error) return { error: error.message }

  await supabase.from("group_activities").insert({
    id: randomUUID(),
    groupId,
    userId: user.id,
    type: "updated",
    message: "updated group settings",
  })

  revalidatePath(`/groups/${groupId}`)
  return { success: true }
}

export async function generateInviteCodeAction(groupId: string) {
  const user = await getCurrentUserWithRole()
  if (!user) return { error: "Not authenticated" }

  const supabase = createAdminClient()

  const { data: group } = await supabase
    .from("study_groups")
    .select('"createdBy"')
    .eq('"id"', groupId)
    .single()

  if (!group) return { error: "Group not found" }
  if (group.createdBy !== user.id && user.role !== "ADMIN") {
    return { error: "Not authorized" }
  }

  const code = generateInviteCode()

  const { error } = await supabase
    .from("study_groups")
    .update({ inviteCode: code, updatedAt: new Date().toISOString() })
    .eq('"id"', groupId)

  if (error) return { error: error.message }

  revalidatePath(`/groups/${groupId}`)
  return { inviteCode: code }
}

export async function joinGroupByInviteCode(code: string) {
  const user = await getCurrentUserWithRole()
  if (!user) return { error: "Not authenticated" }

  const supabase = createAdminClient()

  const { data: group } = await supabase
    .from("study_groups")
    .select("*")
    .eq('"inviteCode"', code)
    .single()

  if (!group) return { error: "Invalid invite code" }

  return joinGroup(group.id)
}

export async function getMyGroups() {
  const user = await getCurrentUserWithRole()
  if (!user) return []

  const supabase = createAdminClient()

  const { data: memberships } = await supabase
    .from("group_members")
    .select('"groupId"')
    .eq('"userId"', user.id)

  if (!memberships || memberships.length === 0) return []

  const groupIds = memberships.map((m) => m.groupId)

  const { data: groups } = await supabase
    .from("study_groups")
    .select("*")
    .in('"id"', groupIds)
    .order('"createdAt"', { ascending: false })

  const enriched = await Promise.all(
    (groups || []).map(async (group) => {
      const { count } = await supabase
        .from("group_members")
        .select('"id"', { count: "exact", head: true })
        .eq('"groupId"', group.id)

      return { ...group, memberCount: count || 0 }
    })
  )

  return enriched
}

export async function getPublicGroups(search?: string) {
  const supabase = createAdminClient()

  let query = supabase
    .from("study_groups")
    .select("*")
    .eq('"isPublic"', true)
    .order('"createdAt"', { ascending: false })

  if (search?.trim()) {
    query = query.ilike('"name"', `%${search.trim()}%`)
  }

  const { data: groups } = await query

  const enriched = await Promise.all(
    (groups || []).map(async (group) => {
      const { count } = await supabase
        .from("group_members")
        .select('"id"', { count: "exact", head: true })
        .eq('"groupId"', group.id)

      return { ...group, memberCount: count || 0 }
    })
  )

  return enriched
}

export async function getGroupDetails(groupId: string) {
  const supabase = createAdminClient()

  const { data: group } = await supabase
    .from("study_groups")
    .select("*")
    .eq('"id"', groupId)
    .single()

  if (!group) return null

  const { data: members } = await supabase
    .from("group_members")
    .select("*")
    .eq('"groupId"', groupId)
    .order('"joinedAt"', { ascending: true })

  const membersWithProfile = await Promise.all(
    (members || []).map(async (member) => {
      const { data: profile } = await supabase
        .from("users")
        .select('"id","name","image"')
        .eq('"id"', member.userId)
        .single()

      return { ...member, user: profile || null }
    })
  )

  const { data: activities } = await supabase
    .from("group_activities")
    .select("*")
    .eq('"groupId"', groupId)
    .order('"createdAt"', { ascending: false })
    .limit(50)

  const activitiesWithUser = await Promise.all(
    (activities || []).map(async (activity) => {
      const { data: profile } = await supabase
        .from("users")
        .select('"name"')
        .eq('"id"', activity.userId)
        .single()

      return { ...activity, user: profile || null }
    })
  )

  const { count } = await supabase
    .from("group_members")
    .select('"id"', { count: "exact", head: true })
    .eq('"groupId"', groupId)

  return {
    ...group,
    memberCount: count || 0,
    members: membersWithProfile,
    activities: activitiesWithUser,
  }
}

export async function joinGroup(groupId: string) {
  const user = await getCurrentUserWithRole()
  if (!user) return { error: "Not authenticated" }

  const supabase = createAdminClient()

  const { data: group } = await supabase
    .from("study_groups")
    .select("*")
    .eq('"id"', groupId)
    .single()

  if (!group) return { error: "Group not found" }

  const { count } = await supabase
    .from("group_members")
    .select('"id"', { count: "exact", head: true })
    .eq('"groupId"', groupId)

  if (count && count >= group.maxMembers) {
    return { error: "Group has reached maximum capacity" }
  }

  const { data: existing } = await supabase
    .from("group_members")
    .select('"id"')
    .eq('"groupId"', groupId)
    .eq('"userId"', user.id)
    .maybeSingle()

  if (existing) return { error: "Already a member of this group" }

  const { error: memberError } = await supabase.from("group_members").insert({
    id: randomUUID(),
    groupId,
    userId: user.id,
    role: "member",
  })

  if (memberError) return { error: memberError.message }

  await supabase.from("group_activities").insert({
    id: randomUUID(),
    groupId,
    userId: user.id,
    type: "joined",
    message: "joined the group",
  })

  revalidatePath(`/groups/${groupId}`)
  revalidatePath("/groups")
  return { success: true }
}

export async function leaveGroup(groupId: string) {
  const user = await getCurrentUserWithRole()
  if (!user) return { error: "Not authenticated" }

  const supabase = createAdminClient()

  const { error: deleteError } = await supabase
    .from("group_members")
    .delete()
    .eq('"groupId"', groupId)
    .eq('"userId"', user.id)

  if (deleteError) return { error: deleteError.message }

  await supabase.from("group_activities").insert({
    id: randomUUID(),
    groupId,
    userId: user.id,
    type: "left",
    message: "left the group",
  })

  const { count } = await supabase
    .from("group_members")
    .select('"id"', { count: "exact", head: true })
    .eq('"groupId"', groupId)

  if (count === 0) {
    await supabase.from("group_activities").delete().eq('"groupId"', groupId)
    await supabase.from("group_members").delete().eq('"groupId"', groupId)
    await supabase.from("study_groups").delete().eq('"id"', groupId)
    revalidatePath("/groups")
    return { deleted: true }
  }

  revalidatePath(`/groups/${groupId}`)
  revalidatePath("/groups")
  return { success: true }
}

export async function addGroupActivity(groupId: string, type: string, message?: string) {
  const user = await getCurrentUserWithRole()
  if (!user) return { error: "Not authenticated" }

  const supabase = createAdminClient()

  const { error } = await supabase.from("group_activities").insert({
    id: randomUUID(),
    groupId,
    userId: user.id,
    type,
    message: message || null,
  })

  if (error) return { error: error.message }

  revalidatePath(`/groups/${groupId}`)
  return { success: true }
}

export async function getGroupProgress(groupId: string) {
  const supabase = createAdminClient()

  const { data: members } = await supabase
    .from("group_members")
    .select('"userId"')
    .eq('"groupId"', groupId)

  if (!members || members.length === 0) return []

  const userIds = members.map((m) => m.userId)

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*, courses(*)")
    .in('"userId"', userIds)
    .order('"enrolledAt"', { ascending: false })

  const courseMap = new Map()
  for (const enrollment of enrollments || []) {
    const course = (enrollment as Record<string, unknown>).courses as Record<string, unknown> | null
    if (!course) continue
    if (!courseMap.has(course.id)) {
      courseMap.set(course.id, {
        ...course,
        enrolledCount: 0,
        members: [] as string[],
      })
    }
    const entry = courseMap.get(course.id)
    entry.enrolledCount++
    entry.members.push(enrollment.userId)
  }

  return Array.from(courseMap.values())
}

export async function deleteGroup(groupId: string) {
  const user = await getCurrentUserWithRole()
  if (!user) return { error: "Not authenticated" }

  const supabase = createAdminClient()

  const { data: group } = await supabase
    .from("study_groups")
    .select('"createdBy"')
    .eq('"id"', groupId)
    .single()

  if (!group) return { error: "Group not found" }

  const isCreator = group.createdBy === user.id
  const isAdmin = user.role === "ADMIN"

  if (!isCreator && !isAdmin) return { error: "Not authorized to delete this group" }

  await supabase.from("group_activities").delete().eq('"groupId"', groupId)
  await supabase.from("group_members").delete().eq('"groupId"', groupId)
  await supabase.from("study_groups").delete().eq('"id"', groupId)

  revalidatePath("/groups")
  return { success: true }
}
