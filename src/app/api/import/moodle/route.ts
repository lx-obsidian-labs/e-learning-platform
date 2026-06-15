import { importMoodleCourses } from "@/actions/lms-import"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const result = await importMoodleCourses({
    baseUrl: body.baseUrl || process.env.MOODLE_URL || "",
    token: body.token || process.env.MOODLE_TOKEN || "",
  })
  return NextResponse.json(result)
}
