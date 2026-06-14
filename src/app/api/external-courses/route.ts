import { searchExternalCourses } from "@/lib/external-courses"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? undefined
  const courses = await searchExternalCourses(query)
  return NextResponse.json(courses)
}
