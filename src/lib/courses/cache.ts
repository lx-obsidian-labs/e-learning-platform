export interface CacheProvider {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
}

type CacheEntry<T> = { data: T; expiresAt: number }

const TTL = {
  COURSE_CATALOG: 3600,
  COURSE_DETAILS: 1800,
  LESSON_STRUCTURES: 900,
} as const

export class InMemoryCacheProvider implements CacheProvider {
  private store = new Map<string, CacheEntry<unknown>>()
  private timers = new Map<string, NodeJS.Timeout>()

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }
    return entry.data as T
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000
    this.store.set(key, { data: value, expiresAt })
    const existing = this.timers.get(key)
    if (existing) clearTimeout(existing)
    this.timers.set(
      key,
      setTimeout(() => {
        this.store.delete(key)
        this.timers.delete(key)
      }, ttlSeconds * 1000)
    )
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key)
    const timer = this.timers.get(key)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(key)
    }
  }

  async clear(): Promise<void> {
    this.store.clear()
    for (const timer of this.timers.values()) clearTimeout(timer)
    this.timers.clear()
  }
}

export function cacheKey(provider: string, method: string, ...args: string[]): string {
  return `courses:${provider}:${method}:${args.join(":")}`
}

export { TTL }
