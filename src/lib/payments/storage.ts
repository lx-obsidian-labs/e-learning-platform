import { createAdminClient } from "@/lib/supabase/admin"
import { randomUUID } from "crypto"

const BUCKET_NAME = "payment-proofs"

export async function ensureBucket(): Promise<void> {
  const supabase = createAdminClient()

  const { data: buckets } = await supabase.storage.listBuckets()
  const exists = buckets?.some((b) => b.name === BUCKET_NAME)

  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ["image/png", "image/jpeg", "image/jpg", "application/pdf"],
    })
    if (error) {
      console.error("Failed to create storage bucket:", error.message)
    }
  }
}

export async function uploadProofFile(
  base64Data: string,
  mimeType: string
): Promise<string | null> {
  const supabase = createAdminClient()

  await ensureBucket()

  const ext = mimeType === "application/pdf" ? "pdf" : "jpg"
  const fileName = `${randomUUID()}.${ext}`
  const buffer = Buffer.from(base64Data.split(",")[1] || base64Data, "base64")

  const { error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, buffer, {
    contentType: mimeType,
    upsert: false,
  })

  if (error) {
    console.error("Failed to upload proof:", error.message)
    return null
  }

  const { data: publicUrl } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName)
  return publicUrl.publicUrl
}
