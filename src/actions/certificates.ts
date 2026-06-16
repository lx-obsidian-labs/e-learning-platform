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
      courseTitle: cert.course?.title || "Unknown Course",
      courseSlug: cert.course?.slug || "",
      studentName: cert.user?.name || "Unknown",
      studentEmail: cert.user?.email || "",
    },
  }
}
