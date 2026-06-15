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

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q") ?? undefined
    const provider = request.nextUrl.searchParams.get("provider")
    const service = createService()

    if (provider) {
      const result = await service.searchByProvider(provider, query)
      return NextResponse.json(result)
    }

    const result = await service.searchAllProviders(query)
    return NextResponse.json({
      courses: result.courses,
      total: result.courses.length,
      errors: result.errors.length > 0 ? result.errors : undefined,
    })
  } catch (error) {
    const err = toErrorResponse(error)
    return NextResponse.json(err, { status: err.statusCode || 500 })
  }
}
