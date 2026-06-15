import { NextRequest, NextResponse } from "next/server"
import { CourseAggregationService, KhanAcademyProvider, MITOCWProvider, OpenLearnProvider, OpenEdxProvider, toErrorResponse } from "@/lib/courses"

function createService(): CourseAggregationService {
  const service = new CourseAggregationService()
  service.registerProvider(new KhanAcademyProvider())
  service.registerProvider(new MITOCWProvider())
  service.registerProvider(new OpenLearnProvider())
  service.registerProvider(new OpenEdxProvider())
  return service
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sectionId = request.nextUrl.searchParams.get("sectionId") ?? undefined

    const parts = id.split("_")
    const provider = parts[0] === "khan" ? "khan_academy"
      : parts[0] === "mit" ? "mit_ocw"
      : parts[0] === "openlearn" ? "openlearn"
      : parts[0] === "edx" ? "openedx"
      : parts.slice(0, -1).join("_") || "unknown"
    const courseId = parts.slice(1).join("_") || id

    const service = createService()
    const lessons = await service.getLessons(provider, courseId, sectionId)

    return NextResponse.json({ lessons, total: lessons.length })
  } catch (error) {
    const err = toErrorResponse(error)
    return NextResponse.json(err, { status: err.statusCode || 500 })
  }
}
