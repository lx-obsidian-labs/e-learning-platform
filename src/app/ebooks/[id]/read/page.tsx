import { notFound } from "next/navigation"
import Link from "next/link"
import { getEbook, getEbookContent } from "@/actions/ebooks"
import { ArrowLeft, BookOpen } from "lucide-react"

export const dynamic = "force-dynamic"
export const metadata = { title: "Read eBook - Edu Learn" }

type Props = {
  params: Promise<{ id: string }>
}

export default async function EbookReadPage({ params }: Props) {
  const { id } = await params
  const [ebook, content] = await Promise.all([
    getEbook(id),
    getEbookContent(id),
  ])
  if (!ebook || !content) notFound()

  const lines = content.split("\n")

  return (
    <div className="min-h-screen pt-16 sm:pt-20 bg-amber-50/30 dark:bg-stone-950/80">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link
            href={`/ebooks/${id}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to details
          </Link>

          <div className="text-right">
            <h1 className="text-sm font-semibold leading-tight line-clamp-1">{ebook.title}</h1>
            <p className="text-xs text-muted-foreground">{ebook.author}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-stone-900 shadow-xl shadow-black/5 border p-6 sm:p-10 md:p-14">
          <div className="prose prose-stone dark:prose-invert prose-sm sm:prose-base max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-stone-700 dark:prose-p:text-stone-300 prose-a:text-indigo-600 dark:prose-a:text-indigo-400">
            {lines.map((line, i) => {
              const trimmed = line.trim()

              if (!trimmed) {
                return <br key={i} />
              }

              if (/^[A-Z\s]{5,}$/.test(trimmed) && trimmed.length < 100) {
                return (
                  <h2 key={i} className="text-lg font-bold mt-8 mb-4 text-center">
                    {trimmed}
                  </h2>
                )
              }

              return (
                <p key={i} className="mb-3 first:mt-0">
                  {trimmed}
                </p>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-8 text-xs text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5" />
          <span>Public Domain · {ebook.sourceName}</span>
        </div>
      </div>
    </div>
  )
}
