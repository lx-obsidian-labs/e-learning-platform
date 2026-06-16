import type { Ebook, EbookProvider } from "./types"
import { GutendexProvider } from "./providers/gutendex"
import { OpenLibraryProvider } from "./providers/open-library"
import { CuratedProvider } from "./providers/curated"

const CACHE_TTL = 30 * 60 * 1000

type CacheEntry = {
  data: Ebook[]
  timestamp: number
}

class EbookCache {
  private cache = new Map<string, CacheEntry>()

  get(key: string): Ebook[] | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      this.cache.delete(key)
      return null
    }
    return entry.data
  }

  set(key: string, data: Ebook[]) {
    this.cache.set(key, { data, timestamp: Date.now() })
  }
}

export class EbookAggregationService {
  private providers: EbookProvider[] = []
  private cache = new EbookCache()

  constructor() {
    this.registerProvider(new GutendexProvider())
    this.registerProvider(new OpenLibraryProvider())
    this.registerProvider(new CuratedProvider())
  }

  registerProvider(provider: EbookProvider) {
    this.providers.push(provider)
  }

  async searchEbooks(query?: string, options?: { category?: string; limit?: number }): Promise<Ebook[]> {
    const cacheKey = JSON.stringify({ query, options })
    const cached = this.cache.get(cacheKey)
    if (cached) return cached

    const results = await Promise.allSettled(
      this.providers.map((p) => p.searchEbooks(query, options))
    )

    const ebooks: Ebook[] = []
    for (const result of results) {
      if (result.status === "fulfilled") {
        ebooks.push(...result.value)
      }
    }

    const limit = options?.limit || 24
    const deduped = this.deduplicate(ebooks).slice(0, limit)
    this.cache.set(cacheKey, deduped)
    return deduped
  }

  async getEbook(id: string): Promise<Ebook | null> {
    for (const provider of this.providers) {
      try {
        const book = await provider.getEbook(id)
        if (book) return book
      } catch {
        continue
      }
    }
    return null
  }

  async getEbookContent(id: string): Promise<string | null> {
    for (const provider of this.providers) {
      if (provider.getContent) {
        try {
          const content = await provider.getContent(id)
          if (content) return content
        } catch {
          continue
        }
      }
    }
    return null
  }

  getCategories(): string[] {
    return [
      "Classics", "Fiction", "Fantasy", "Science Fiction", "Mystery",
      "Horror", "Romance", "History", "Philosophy", "Poetry",
      "Biography", "Science", "Children", "Drama",
    ]
  }

  private deduplicate(ebooks: Ebook[]): Ebook[] {
    const seen = new Set<string>()
    return ebooks.filter((b) => {
      const key = `${b.title.toLowerCase()}|${b.author.toLowerCase()}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }
}

let service: EbookAggregationService | null = null

export function getDefaultEbookService(): EbookAggregationService {
  if (!service) {
    service = new EbookAggregationService()
  }
  return service
}
