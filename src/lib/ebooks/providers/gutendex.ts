import type { Ebook, EbookProvider } from "../types"

const BASE = "https://gutendex.com"
const TIMEOUT = 5000

type GutendexBook = {
  id: number
  title: string
  authors: { name: string; birth_year: number | null; death_year: number | null }[]
  subjects: string[]
  bookshelves: string[]
  languages: string[]
  formats: Record<string, string>
  download_count: number
}

type GutendexResponse = {
  count: number
  next: string | null
  previous: string | null
  results: GutendexBook[]
}

const CATEGORY_MAP: Record<string, string> = {
  fiction: "Fiction",
  "science fiction": "Science Fiction",
  fantasy: "Fantasy",
  mystery: "Mystery",
  horror: "Horror",
  romance: "Romance",
  history: "History",
  philosophy: "Philosophy",
  poetry: "Poetry",
  drama: "Drama",
  children: "Children",
  biography: "Biography",
  science: "Science",
  classics: "Classics",
}

function classifyBook(book: GutendexBook): string {
  const subjects = book.subjects.map((s) => s.toLowerCase())
  const shelves = book.bookshelves.map((s) => s.toLowerCase())

  for (const [keyword, category] of Object.entries(CATEGORY_MAP)) {
    if (
      subjects.some((s) => s.includes(keyword)) ||
      shelves.some((s) => s.includes(keyword))
    ) {
      return category
    }
  }
  return "Classics"
}

export class GutendexProvider implements EbookProvider {
  readonly name = "gutendex"
  readonly sourceName = "Project Gutenberg"

  async searchEbooks(query?: string, options?: { category?: string; limit?: number }): Promise<Ebook[]> {
    const params = new URLSearchParams()
    if (query) params.set("search", query)
    if (options?.limit) params.set("page_size", String(Math.min(options.limit, 100)))

    const queryString = params.toString()
    const url = queryString ? `${BASE}/books?${queryString}` : `${BASE}/books`

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT)
    try {
      const res = await fetch(url, { signal: controller.signal, next: { revalidate: 3600 } })
      if (!res.ok) return []
      const data: GutendexResponse = await res.json()
      let books = data.results.map((b) => this.mapBook(b))

      if (options?.category) {
        const cat = options.category.toLowerCase()
        books = books.filter((b) => b.category?.toLowerCase() === cat)
      }

      return books
    } catch {
      return []
    } finally {
      clearTimeout(timer)
    }
  }

  async getEbook(id: string): Promise<Ebook | null> {
    const numericId = id.replace("gutendex_", "")
    const url = `${BASE}/books/${numericId}`

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT)
    try {
      const res = await fetch(url, { signal: controller.signal, next: { revalidate: 3600 } })
      if (!res.ok) return null
      const book: GutendexBook = await res.json()
      return this.mapBook(book)
    } catch {
      return null
    } finally {
      clearTimeout(timer)
    }
  }

  private mapBook(book: GutendexBook): Ebook {
    const id = `gutendex_${book.id}`
    const author = book.authors.map((a) => a.name).join(", ") || "Unknown"
    const textUrl = book.formats["text/plain; charset=us-ascii"] || book.formats["text/plain"] || ""
    const htmlUrl = book.formats["text/html"] || book.formats["text/html; charset=utf-8"] || ""
    const epubUrl = book.formats["application/epub+zip"] || ""
    const coverUrl = book.formats["image/jpeg"] || null
    const fileUrl = textUrl || htmlUrl || epubUrl || `https://www.gutenberg.org/ebooks/${book.id}`

    const subjects = book.subjects.slice(0, 3).join(", ")

    return {
      id,
      title: book.title.replace(/\r?\n/g, " ").trim(),
      author,
      description: subjects ? `Subjects: ${subjects}` : null,
      coverUrl,
      fileUrl,
      source: "gutendex",
      sourceName: "Project Gutenberg",
      category: classifyBook(book),
      pages: null,
    }
  }
}
