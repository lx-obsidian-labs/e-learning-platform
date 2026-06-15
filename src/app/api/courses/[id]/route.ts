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
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const parts = id.split("_")
    const provider = parts[0] === "khan" ? "khan_academy"
      : parts[0] === "mit" ? "mit_ocw"
      : parts[0] === "openlearn" ? "openlearn"
      : parts[0] === "edx" ? "openedx"
      : parts.slice(0, -1).join("_") || "unknown"
    const courseId = parts.slice(1).join("_") || id

    const service = createService()
    const course = await service.getCourse(provider, courseId)

    if (!course) {
      return NextResponse.json({ error: "Course not found", code: "NOT_FOUND" }, { status: 404 })
    }

    return NextResponse.json(course)
  } catch (error) {
    const err = toErrorResponse(error)
    return NextResponse.json(err, { status: err.statusCode || 500 })
  }
}
