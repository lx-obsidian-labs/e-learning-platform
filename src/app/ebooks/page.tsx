import Link from "next/link"
import { getEbooks, getEbookCategories } from "@/actions/ebooks"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Bookmark, ArrowRight } from "lucide-react"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Free eBooks - Edu Learn",
  description: "Browse our collection of free classic ebooks. Read timeless literature, philosophy, and more online.",
}

type Props = {
  searchParams: Promise<{ category?: string; search?: string }>
}

export default async function EbooksPage({ searchParams }: Props) {
  const params = await searchParams
  const [ebooks, categories] = await Promise.all([
    getEbooks({ category: params.category, search: params.search }),
    getEbookCategories(),
  ])

  return (
    <div className="min-h-screen pt-16 sm:pt-20">
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-primary/[0.05]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center relative">
          <Badge variant="secondary" className="mb-4">Free Library</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Free eBooks
          </h1>
          <p className="lead max-w-2xl mx-auto mt-4">
            Read timeless classics, philosophy, science, and more. All completely free.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-3 mb-10">
            <Link
              href="/ebooks"
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                !params.category
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/ebooks?category=${encodeURIComponent(cat)}`}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  params.category === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>

          {ebooks.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground">No ebooks found</h3>
              <p className="text-sm text-muted-foreground/60 mt-1">
                {params.search ? "Try a different search term." : "Check back later for new additions."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {ebooks.map((ebook) => (
                <Link key={ebook.id} href={`/ebooks/${ebook.id}`} className="group">
                  <Card variant="pro" className="card-hover h-full overflow-hidden">
                    <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                      {ebook.coverUrl ? (
                        <img
                          src={ebook.coverUrl}
                          alt={ebook.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                          <BookOpen className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                      )}
                      {ebook.featured && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0 text-[10px]">
                            Featured
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {ebook.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">{ebook.author}</p>
                      {ebook.pages && (
                        <p className="text-[10px] text-muted-foreground/60">{ebook.pages} pages</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {!params.category && !params.search && (
            <div className="mt-16 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
                <Bookmark className="h-4 w-4" />
                All ebooks are sourced from Project Gutenberg and Open Library &middot; Public Domain
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
