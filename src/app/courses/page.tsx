import { getPublishedCourses } from "@/actions/courses"
import { getCategories } from "@/actions/categories"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FilterBar } from "@/components/filter-bar"

export const dynamic = "force-dynamic"

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; sort?: string; price?: string; rating?: string }>
}) {
  const sp = await searchParams
  const [categories, courses] = await Promise.all([
    getCategories(),
    getPublishedCourses({
      category: sp.category,
      query: sp.q,
      sort: sp.sort || "newest",
      priceFilter: sp.price,
      minRating: sp.rating ? Number(sp.rating) : 0,
    }),
  ])

  return (
    <div className="min-h-screen pt-16 sm:pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
        <FilterBar
          categories={categories}
          current={{
            category: sp.category,
            q: sp.q,
            sort: sp.sort,
            price: sp.price,
            rating: sp.rating,
          }}
        />

        {courses.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">No courses found</h3>
            <p className="text-muted-foreground text-sm">
              {sp.q ? `No results for "${sp.q}"` : "No courses match your filters"}
            </p>
            <Button variant="outline" asChild>
              <Link href="/courses">Clear filters</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, idx) => {
              const colors = [
                "from-blue-600 to-purple-600",
                "from-emerald-600 to-teal-600",
                "from-orange-600 to-red-600",
                "from-pink-600 to-rose-600",
                "from-indigo-600 to-blue-600",
                "from-teal-600 to-cyan-600",
              ]
              const gradient = colors[idx % colors.length]

              return (
                <Link key={course.id} href={`/courses/${course.slug}`} className="group animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                  <Card className="overflow-hidden card-hover h-full border-0 shadow-sm">
                    <div className={`aspect-video relative overflow-hidden ${course.thumbnail ? "" : `bg-gradient-to-br ${gradient}`}`}>
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                          <div className="thumbnail-overlay absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="h-16 w-16 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 group-hover:bg-white/40 transition-all shadow-lg">
                            <svg className="h-8 w-8 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </>
                      )}
                      <Badge className="absolute top-3 left-3 bg-black/40 text-white border-0 backdrop-blur-sm">
                        {course.isFree ? "Free" : `$${Number(course.price).toFixed(2)}`}
                      </Badge>
                      <div className="absolute top-3 right-3">
                        {course.rating > 0 && (
                          <Badge variant="secondary" className="bg-black/40 text-white border-0 backdrop-blur-sm">
                            ★ {course.rating.toFixed(1)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="line-clamp-1 text-base group-hover:text-primary transition-colors">
                        {course.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={course.instructor.image ?? undefined} />
                          <AvatarFallback className="text-[10px]">
                            {course.instructor.name?.[0] ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span>{course.instructor.name}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3 space-y-2">
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between text-xs text-muted-foreground pt-0 border-t px-6 py-3">
                      <span className="flex items-center gap-1.5">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                        {course._count.enrollments} enrolled
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </svg>
                        {course._count.reviews} reviews
                      </span>
                      {course.category && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {course.category.name}
                        </Badge>
                      )}
                    </CardFooter>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
