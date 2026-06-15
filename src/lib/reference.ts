import { createAdminClient } from "@/lib/supabase/admin"

const PREFIX = "RIV"

export async function generateReference(): Promise<string> {
  const admin = createAdminClient()
  const date = new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  const dateStr = `${y}${m}${d}`

  const { count } = await admin
    .from("orders")
    .select("*", { count: "exact", head: true })
    .like('"reference"', `${PREFIX}-${dateStr}-%`)

  const seq = String((count ?? 0) + 1).padStart(4, "0")
  return `${PREFIX}-${dateStr}-${seq}`
}
