import type { Ebook, EbookProvider } from "../types"

const SEARCH_BASE = "https://openlibrary.org/search.json"
const DETAILS_BASE = "https://openlibrary.org"
const COVERS_BASE = "https://covers.openlibrary.org/b/id"
const TIMEOUT = 8000

type OLSearchResult = {
  key: string
  title: string
  author_name?: string[]
  first_publish_year?: number
  subject?: string[]
  ia_collection?: string[]
  cover_i?: number
  ebook_access: string
  ebook_count_i?: number
  edition_count: number
}

type OLSearchResponse = {
  numFound: number
  docs: OLSearchResult[]
}

type OLEbookData = {
  key: string
  title: string
  authors?: { author: { key: string } }[]
  description?: string | { value: string }
  subjects?: string[]
  covers?: number[]
  excerpts?: { text: string }[]
}

const CATEGORY_MAP: Record<string, string> = {
  fiction: "Fiction",
  fantasy: "Fantasy",
  "science fiction": "Science Fiction",
  mystery: "Mystery",
  horror: "Horror",
  romance: "Romance",
  history: "History",
  philosophy: "Philosophy",
  poetry: "Poetry",
  biography: "Biography",
  science: "Science",
  "short stories": "Fiction",
  classics: "Classics",
  drama: "Drama",
  children: "Children",
}

function classifyBook(subjects: string[] | undefined): string {
  if (!subjects) return "Fiction"
  const all = subjects.map((s) => s.toLowerCase())
  for (const [keyword, category] of Object.entries(CATEGORY_MAP)) {
    if (all.some((s) => s.includes(keyword))) return category
  }
  return "Fiction"
}

export class OpenLibraryProvider implements EbookProvider {
  readonly name = "openlibrary"
  readonly sourceName = "Open Library"

  async searchEbooks(query?: string, options?: { category?: string; limit?: number }): Promise<Ebook[]> {
    const params = new URLSearchParams()
    const q = query || "classic literature"
    params.set("q", q)
    params.set("limit", String(options?.limit || 24))
    params.set("sort", "rating")

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT)
    try {
      const url = `${SEARCH_BASE}?${params}`
      const res = await fetch(url, { signal: controller.signal, next: { revalidate: 3600 } })
      if (!res.ok) return []
      const data: OLSearchResponse = await res.json()

      let results = data.docs.filter((d) => d.ebook_access === "borrowable" || d.ebook_count_i || d.ia_collection)
      if (results.length === 0) results = data.docs.slice(0, 24)

      let ebooks = results.map((d) => this.mapSearchResult(d))

      if (options?.category) {
        const cat = options.category.toLowerCase()
        ebooks = ebooks.filter((b) => b.category?.toLowerCase() === cat)
      }

      return ebooks.slice(0, options?.limit || 24)
    } catch {
      return []
    } finally {
      clearTimeout(timer)
    }
  }

  async getEbook(id: string): Promise<Ebook | null> {
    const olId = id.replace("openlibrary_", "/works/")
    const url = `${DETAILS_BASE}${olId}.json`

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT)
    try {
      const res = await fetch(url, { signal: controller.signal, next: { revalidate: 3600 } })
      if (!res.ok) return null
      const data: OLEbookData = await res.json()
      return this.mapDetails(data, id)
    } catch {
      return null
    } finally {
      clearTimeout(timer)
    }
  }

  private mapSearchResult(doc: OLSearchResult): Ebook {
    const id = `openlibrary_${doc.key.replace("/works/", "")}`
    const coverUrl = doc.cover_i ? `${COVERS_BASE}/${doc.cover_i}-L.jpg` : null
    const author = doc.author_name?.join(", ") || "Unknown"
    const subjects = doc.subject?.slice(0, 3).join(", ") || null

    return {
      id,
      title: doc.title,
      author,
      description: subjects ? `Subjects: ${subjects}` : null,
      coverUrl,
      fileUrl: `https://openlibrary.org${doc.key}`,
      source: "openlibrary",
      sourceName: "Open Library",
      category: classifyBook(doc.subject),
      pages: null,
    }
  }

  private mapDetails(data: OLEbookData, id: string): Ebook {
    const description = typeof data.description === "string"
      ? data.description
      : data.description?.value || null
    const authorKey = data.authors?.[0]?.author?.key || ""
    const coverUrl = data.covers?.[0] ? `${COVERS_BASE}/${data.covers[0]}-L.jpg` : null
    const subjects = data.subjects?.slice(0, 3).join(", ") || null

    return {
      id,
      title: data.title,
      author: authorKey ? authorKey.replace("/authors/", "") : "Unknown",
      description: description || subjects,
      coverUrl,
      fileUrl: `https://openlibrary.org${data.key}`,
      source: "openlibrary",
      sourceName: "Open Library",
      category: classifyBook(data.subjects),
      pages: null,
    }
  }
}
