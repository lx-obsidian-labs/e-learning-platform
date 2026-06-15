import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { importEdxCourse } from "@/actions/edx-import"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from("users").select("role").eq('"id"', user.id).single()
  if (!profile || profile.role === "STUDENT") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { courseId } = body
  if (!courseId) return NextResponse.json({ error: "Missing courseId" }, { status: 400 })

  try {
    const result = await importEdxCourse(courseId)
    if (result.error) return NextResponse.json(result, { status: 400 })
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Import failed" }, { status: 500 })
  }
}
