"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getCurrentUserWithRole } from "@/actions/auth"
import { revalidatePath } from "next/cache"

export async function requireAdmin() {
  const user = await getCurrentUserWithRole()
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized")
  return user
}

export async function getPlatformStats() {
  try {
    await requireAdmin()
    const admin = createAdminClient()

    const { count: totalUsers } = await admin.from("users").select("*", { count: "exact", head: true })
    const { count: totalStudents } = await admin.from("users").select("*", { count: "exact", head: true }).eq('"role"', "STUDENT")
    const { count: totalInstructors } = await admin.from("users").select("*", { count: "exact", head: true }).eq('"role"', "INSTRUCTOR")
    const { count: totalAdmins } = await admin.from("users").select("*", { count: "exact", head: true }).eq('"role"', "ADMIN")
    const { count: totalCourses } = await admin.from("courses").select("*", { count: "exact", head: true })
    const { count: totalEnrollments } = await admin.from("enrollments").select("*", { count: "exact", head: true })
    const { count: totalLessonsCompleted } = await admin.from("lesson_completions").select("*", { count: "exact", head: true })

    const { count: completedEnrollments } = await admin
      .from("enrollments")
      .select("*", { count: "exact", head: true })
      .eq('"status"', "COMPLETED")

    const avgCompletionRate = totalEnrollments && totalEnrollments > 0
      ? Math.round(((completedEnrollments || 0) / totalEnrollments) * 100)
      : 0

    const now = new Date()
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const { count: newUsersThisMonth } = await admin
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte('"createdAt"', firstOfMonth)

    const { count: newEnrollmentsThisMonth } = await admin
      .from("enrollments")
      .select("*", { count: "exact", head: true })
      .gte('"enrolledAt"', firstOfMonth)

    let totalRevenue = 0
    try {
      const { data: orders } = await admin
        .from("orders")
        .select('"amount"')
        .eq('"status"', "COMPLETED")
      totalRevenue = orders?.reduce((sum: number, o: any) => sum + Number(o.amount), 0) || 0
    } catch {
      // orders table may not exist
    }

    return {
      totalUsers: totalUsers || 0,
      totalStudents: totalStudents || 0,
      totalInstructors: totalInstructors || 0,
      totalAdmins: totalAdmins || 0,
      totalCourses: totalCourses || 0,
      totalEnrollments: totalEnrollments || 0,
      totalRevenue,
      totalLessonsCompleted: totalLessonsCompleted || 0,
      avgCompletionRate,
      newUsersThisMonth: newUsersThisMonth || 0,
      newEnrollmentsThisMonth: newEnrollmentsThisMonth || 0,
    }
  } catch {
    return null
  }
}

export async function getUsers(page: number = 1, search?: string, role?: string) {
  try {
    await requireAdmin()
    const admin = createAdminClient()
    const pageSize = 20
    const offset = (page - 1) * pageSize

    let query = admin.from("users").select("*", { count: "exact" })

    if (role && role !== "ALL") {
      query = query.eq('"role"', role)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data: users, count } = await query
      .order('"createdAt"', { ascending: false })
      .range(offset, offset + pageSize - 1)

    return { users: users || [], total: count || 0, page, pageSize }
  } catch {
    return { users: [], total: 0, page: 1, pageSize: 20 }
  }
}

export async function updateUserRole(userId: string, role: string) {
  try {
    const user = await requireAdmin()
    if (userId === user.id) return { error: "Cannot change your own role" }
    if (!["STUDENT", "INSTRUCTOR", "ADMIN"].includes(role)) return { error: "Invalid role" }

    const admin = createAdminClient()
    const { error } = await admin
      .from("users")
      .update({ role, updatedAt: new Date().toISOString() })
      .eq('"id"', userId)

    if (error) return { error: "Failed to update role" }
    revalidatePath("/admin/users")
    return { success: true }
  } catch {
    return { error: "Unauthorized" }
  }
}

export async function getCourses(page: number = 1, search?: string, status?: string) {
  try {
    await requireAdmin()
    const admin = createAdminClient()
    const pageSize = 20
    const offset = (page - 1) * pageSize

    let query = admin
      .from("courses")
      .select("*, users!courses_instructorId_fkey(name)", { count: "exact" })

    if (status && status !== "ALL") {
      query = query.eq('"status"', status)
    }

    if (search) {
      query = query.ilike('"title"', `%${search}%`)
    }

    const { data: courses, count } = await query
      .order('"createdAt"', { ascending: false })
      .range(offset, offset + pageSize - 1)

    const enriched = await Promise.all(
      (courses || []).map(async (course: any) => {
        const { count: enrollmentCount } = await admin
          .from("enrollments")
          .select("*", { count: "exact", head: true })
          .eq('"courseId"', course.id)
        return { ...course, enrollmentCount: enrollmentCount || 0 }
      })
    )

    return { courses: enriched, total: count || 0, page, pageSize }
  } catch {
    return { courses: [], total: 0, page: 1, pageSize: 20 }
  }
}

export async function updateCourseStatus(courseId: string, status: string) {
  try {
    await requireAdmin()
    if (!["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) return { error: "Invalid status" }

    const admin = createAdminClient()
    const { error } = await admin
      .from("courses")
      .update({ status })
      .eq('"id"', courseId)

    if (error) return { error: "Failed to update status" }
    revalidatePath("/admin/courses")
    return { success: true }
  } catch {
    return { error: "Unauthorized" }
  }
}

export async function getDiscussions(page: number = 1) {
  try {
    await requireAdmin()
    const admin = createAdminClient()
    const pageSize = 20
    const offset = (page - 1) * pageSize

    const { data: discussions, count } = await admin
      .from("discussions")
      .select("*, users!discussions_userId_fkey(name, image), courses!discussions_courseId_fkey(title)", { count: "exact" })
      .is('"parentId"', null)
      .order('"createdAt"', { ascending: false })
      .range(offset, offset + pageSize - 1)

    return {
      discussions: (discussions || []).map((d: any) => ({
        ...d,
        userName: d.users?.name || "Unknown",
        userImage: d.users?.image || null,
        courseTitle: d.courses?.title || "Unknown",
      })),
      total: count || 0,
      page,
      pageSize,
    }
  } catch {
    return { discussions: [], total: 0, page: 1, pageSize: 20 }
  }
}

export async function deleteDiscussion(discussionId: string) {
  try {
    await requireAdmin()
    const admin = createAdminClient()

    await admin.from("discussions").delete().eq('"parentId"', discussionId)
    const { error } = await admin.from("discussions").delete().eq('"id"', discussionId)

    if (error) return { error: "Failed to delete discussion" }
    revalidatePath("/admin/discussions")
    return { success: true }
  } catch {
    return { error: "Unauthorized" }
  }
}

export async function getRecentActivity(limit: number = 10) {
  try {
    await requireAdmin()
    const admin = createAdminClient()

    const { data: recentEnrollments } = await admin
      .from("enrollments")
      .select("*, users!enrollments_userId_fkey(name), courses!enrollments_courseId_fkey(title)")
      .order('"enrolledAt"', { ascending: false })
      .limit(limit)

    const { data: recentCompletions } = await admin
      .from("lesson_completions")
      .select("*, users!lesson_completions_userId_fkey(name)")
      .order('"completedAt"', { ascending: false })
      .limit(limit)

    const { data: recentUsers } = await admin
      .from("users")
      .select("*")
      .order('"createdAt"', { ascending: false })
      .limit(limit)

    const activities: { type: string; description: string; timestamp: string }[] = []

    for (const e of recentEnrollments || []) {
      activities.push({
        type: "enrollment",
        description: `${e.users?.name || "A user"} enrolled in "${e.courses?.title || "a course"}"`,
        timestamp: e.enrolledAt,
      })
    }

    for (const c of recentCompletions || []) {
      activities.push({
        type: "lesson",
        description: `${c.users?.name || "A user"} completed a lesson`,
        timestamp: c.completedAt,
      })
    }

    for (const u of recentUsers || []) {
      activities.push({
        type: "user",
        description: `${u.name || "Someone"} joined as ${u.role}`,
        timestamp: u.createdAt,
      })
    }

    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    return activities.slice(0, limit)
  } catch {
    return []
  }
}

export async function getRevenueData(days: number = 30) {
  try {
    await requireAdmin()
    const admin = createAdminClient()

    const since = new Date(Date.now() - days * 86400000).toISOString()

    const { data: orders } = await admin
      .from("orders")
      .select('"amount", "createdAt"')
      .eq('"status"', "COMPLETED")
      .gte('"createdAt"', since)
      .order('"createdAt"', { ascending: true })

    if (!orders) return []

    const dailyMap: Record<string, number> = {}
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().split("T")[0]
      dailyMap[d] = 0
    }

    for (const o of orders) {
      const date = new Date(o.createdAt).toISOString().split("T")[0]
      if (dailyMap[date] !== undefined) {
        dailyMap[date] += Number(o.amount)
      }
    }

    return Object.entries(dailyMap).map(([date, amount]) => ({ date, amount }))
  } catch {
    return []
  }
}
