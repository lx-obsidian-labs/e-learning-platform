import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from("users").select("role").eq('"id"', user.id).single()
  if (!profile || profile.role === "STUDENT") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const query = request.nextUrl.searchParams.get("q") ?? undefined

  try {
    const { searchEdxCourses } = await import("@/actions/edx-import")
    const courses = await searchEdxCourses(query)
    return NextResponse.json({ courses })
  } catch {
    return NextResponse.json({ error: "Failed to search edX courses" }, { status: 500 })
  }
}
