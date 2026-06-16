import { notFound } from "next/navigation"
import Link from "next/link"
import { getEbook } from "@/actions/ebooks"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BookOpen, ExternalLink, BookMarked, FileText } from "lucide-react"

export const dynamic = "force-dynamic"
export const metadata = { title: "Read eBook - Edu Learn" }

type Props = {
  params: Promise<{ id: string }>
}

export default async function EbookPage({ params }: Props) {
  const { id } = await params
  const ebook = await getEbook(id)
  if (!ebook) notFound()

  return (
    <div className="min-h-screen pt-16 sm:pt-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        <Link
          href="/ebooks"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to eBooks
        </Link>

        <div className="grid gap-8 lg:grid-cols-[350px_1fr]">
          <div className="space-y-4">
            <div className="aspect-[3/4] rounded-xl overflow-hidden bg-muted">
              {ebook.coverUrl ? (
                <img
                  src={ebook.coverUrl}
                  alt={ebook.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                  <BookOpen className="h-16 w-16 text-muted-foreground/30" />
                </div>
              )}
            </div>

            <Button className="btn-premium w-full" asChild>
              <Link href={`/ebooks/${ebook.id}/read`}>
                <BookMarked className="h-4 w-4 mr-2" />
                Read Now
              </Link>
            </Button>

            <Button variant="outline" className="w-full" asChild>
              <a href={ebook.fileUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open on {ebook.sourceName}
              </a>
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {ebook.category && <Badge variant="secondary">{ebook.category}</Badge>}
                {ebook.pages && (
                  <span className="text-xs text-muted-foreground">{ebook.pages} pages</span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{ebook.title}</h1>
              <p className="text-lg text-muted-foreground mt-2">by {ebook.author}</p>
            </div>

            {ebook.description && (
              <Card variant="pro">
                <CardContent className="pt-6">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/60 mb-3">
                    About This Book
                  </h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {ebook.description}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card variant="pro">
              <CardContent className="pt-6 space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Details
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Author</p>
                    <p className="font-medium">{ebook.author}</p>
                  </div>
                  {ebook.pages && (
                    <div>
                      <p className="text-muted-foreground text-xs">Pages</p>
                      <p className="font-medium">{ebook.pages}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground text-xs">Category</p>
                    <p className="font-medium">{ebook.category || "General"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Source</p>
                    <p className="font-medium">{ebook.sourceName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
              <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                This ebook is in the public domain and is provided free of charge. Source: {ebook.sourceName}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
