import { importOpenEdxCourses } from "@/actions/lms-import"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const result = await importOpenEdxCourses({
    baseUrl: body.baseUrl || process.env.OPENEDX_BASE_URL || "",
    clientId: body.clientId || process.env.OPENEDX_CLIENT_ID || "",
    clientSecret: body.clientSecret || process.env.OPENEDX_CLIENT_SECRET || "",
  })
  return NextResponse.json(result)
}
