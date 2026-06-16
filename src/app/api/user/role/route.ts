import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ role: null })

    const admin = createAdminClient()
    const { data: profile } = await admin
      .from("users")
      .select("role")
      .eq('"id"', user.id)
      .single()

    return NextResponse.json({ role: profile?.role || "STUDENT" })
  } catch {
    return NextResponse.json({ role: "STUDENT" })
  }
}
