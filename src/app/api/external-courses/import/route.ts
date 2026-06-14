import { auth } from "@/lib/auth"
import { importExternalCourse } from "@/lib/external-courses"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user || session.user.role === "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  try {
    const course = await importExternalCourse(
      body,
      session.user.id
    )
    return NextResponse.json(course)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to import course" },
      { status: 500 }
    )
  }
}
