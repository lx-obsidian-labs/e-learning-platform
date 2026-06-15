import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { importExternalCourse } from "@/lib/external-courses"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: userProfile } = await admin
    .from('users')
    .select('role')
    .eq('"id"', user.id)
    .single()

  if (!userProfile || userProfile.role === "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  try {
    const course = await importExternalCourse(
      body,
      user.id
    )
    return NextResponse.json(course)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to import course" },
      { status: 500 }
    )
  }
}
