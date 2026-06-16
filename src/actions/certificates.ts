"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getCurrentUserWithRole } from "@/actions/auth"
import { randomUUID, createHash } from "crypto"
import { revalidatePath } from "next/cache"

function generateCertificateHash(userId: string, courseId: string, timestamp: string): string {
  const data = `${userId}:${courseId}:${timestamp}:edu-learn-v1`
  return createHash("sha256").update(data).digest("hex")
}

export async function issueCertificate(courseId: string) {
  const user = await getCurrentUserWithRole()
  if (!user) return { error: "Not authenticated" }

  const supabase = createAdminClient()

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq('"userId"', user.id)
    .eq('"courseId"', courseId)
    .single()

  if (!enrollment) return { error: "Not enrolled in this course" }
  if (enrollment.status !== "COMPLETED") return { error: "Course not yet completed" }

  const { data: existing } = await supabase
    .from("certificates")
    .select("id")
    .eq('"userId"', user.id)
    .eq('"courseId"', courseId)
    .maybeSingle()

  if (existing) {
    const { data: cert } = await supabase
      .from("certificates")
      .select("*, course:courseId(title, slug), user:userId(name, email)")
      .eq('"id"', existing.id)
      .single()
    return { certificate: cert }
  }

  const id = randomUUID()
  const now = new Date().toISOString()
  const hash = generateCertificateHash(user.id, courseId, now)

  const { error: insertError } = await supabase
    .from("certificates")
    .insert({
      id,
      userId: user.id,
      courseId,
      hash,
      issuedAt: now,
      metadata: {
        issuedAt: now,
        version: "1.0",
        platform: "Edu Learn",
      },
    })

  if (insertError) return { error: insertError.message }

  const { data: cert } = await supabase
    .from("certificates")
    .select("*, course:courseId(title, slug), user:userId(name, email)")
    .eq('"id"', id)
    .single()

  revalidatePath("/dashboard")
  revalidatePath(`/certificates/${id}`)

  return { certificate: cert }
}

export async function getMyCertificates() {
  const user = await getCurrentUserWithRole()
  if (!user) return []

  const supabase = createAdminClient()

  const { data: certs } = await supabase
    .from("certificates")
    .select("*, course:courseId(title, slug, description), user:userId(name)")
    .eq('"userId"', user.id)
    .order('"issuedAt"', { ascending: false })

  return certs || []
}

export async function getCertificateById(certId: string) {
  const supabase = createAdminClient()

  const { data: cert } = await supabase
    .from("certificates")
    .select("*, course:courseId(title, slug, description, instructorId, users:instructorId(name)), user:userId(name, email)")
    .eq('"id"', certId)
    .single()

  return cert || null
}

export async function verifyCertificateByHash(hash: string) {
  const supabase = createAdminClient()

  const { data: cert } = await supabase
    .from("certificates")
    .select("*, course:courseId(title, slug), user:userId(name, email)")
    .eq('"hash"', hash)
    .maybeSingle()

  if (!cert) return null

  const expectedHash = generateCertificateHash(cert.userId, cert.courseId, cert.issuedAt)
  const valid = expectedHash === hash

  return {
    valid,
    certificate: {
      id: cert.id,
      hash: cert.hash,
      issuedAt: cert.issuedAt,
      revokedAt: cert.revokedAt || null,
      courseTitle: cert.course?.title || "Unknown Course",
      courseSlug: cert.course?.slug || "",
      studentName: cert.user?.name || "Unknown",
      studentEmail: cert.user?.email || "",
    },
  }
}

export async function revokeCertificate(certId: string, reason?: string) {
  const user = await getCurrentUserWithRole()
  if (!user || user.role !== "ADMIN") return { error: "Not authorized" }

  const supabase = createAdminClient()

  const { data: cert } = await supabase
    .from("certificates")
    .select("id, revokedAt")
    .eq('"id"', certId)
    .single()

  if (!cert) return { error: "Certificate not found" }
  if (cert.revokedAt) return { error: "Certificate already revoked" }

  const { error } = await supabase
    .from("certificates")
    .update({
      revokedAt: new Date().toISOString(),
      revokedBy: user.id,
      revocationReason: reason || null,
    })
    .eq('"id"', certId)

  if (error) return { error: error.message }

  revalidatePath(`/certificates/${certId}`)
  revalidatePath("/admin/certificates")
  return { success: true }
}

export async function getAllCertificates(options?: { page?: number; limit?: number; search?: string }) {
  const user = await getCurrentUserWithRole()
  if (!user || user.role !== "ADMIN") return { certificates: [], total: 0 }

  const supabase = createAdminClient()
  const page = options?.page || 1
  const limit = options?.limit || 20
  const offset = (page - 1) * limit

  let query = supabase
    .from("certificates")
    .select("*, course:courseId(title, slug), user:userId(name, email)", { count: "exact" })

  if (options?.search) {
    query = query.or(`user:userId.name.ilike.%${options.search}%,course:courseId.title.ilike.%${options.search}%`)
  }

  const { data: certs, count } = await query
    .order('"issuedAt"', { ascending: false })
    .range(offset, offset + limit - 1)

  return {
    certificates: certs || [],
    total: count || 0,
    page,
    limit,
  }
}

export async function issueCertificateAdmin(userId: string, courseId: string) {
  const user = await getCurrentUserWithRole()
  if (!user || user.role !== "ADMIN") return { error: "Not authorized" }

  const supabase = createAdminClient()

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq('"userId"', userId)
    .eq('"courseId"', courseId)
    .maybeSingle()

  if (!enrollment) return { error: "User is not enrolled in this course" }

  const { data: existing } = await supabase
    .from("certificates")
    .select("id")
    .eq('"userId"', userId)
    .eq('"courseId"', courseId)
    .maybeSingle()

  if (existing) return { error: "Certificate already exists for this user and course" }

  const id = randomUUID()
  const now = new Date().toISOString()
  const hash = generateCertificateHash(userId, courseId, now)

  const { error: insertError } = await supabase.from("certificates").insert({
    id,
    userId,
    courseId,
    hash,
    issuedAt: now,
    metadata: {
      issuedAt: now,
      version: "1.0",
      platform: "Edu Learn",
      issuedBy: user.id,
    },
  })

  if (insertError) return { error: insertError.message }

  revalidatePath("/admin/certificates")
  return { certificateId: id }
}
