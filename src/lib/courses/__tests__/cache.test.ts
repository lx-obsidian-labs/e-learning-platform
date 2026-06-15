import { describe, it, expect, beforeEach, vi } from "vitest"
import { InMemoryCacheProvider, cacheKey, TTL } from "../cache"

describe("InMemoryCacheProvider", () => {
  let cache: InMemoryCacheProvider

  beforeEach(() => {
    vi.useFakeTimers()
    cache = new InMemoryCacheProvider()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("should store and retrieve values", async () => {
    await cache.set("key1", { data: "hello" }, 60)
    const result = await cache.get("key1")
    expect(result).toEqual({ data: "hello" })
  })

  it("should return null for missing keys", async () => {
    const result = await cache.get("nonexistent")
    expect(result).toBeNull()
  })

  it("should expire entries after TTL", async () => {
    await cache.set("key1", "value", 1)
    vi.advanceTimersByTime(1500)
    const result = await cache.get("key1")
    expect(result).toBeNull()
  })

  it("should delete entries", async () => {
    await cache.set("key1", "value", 60)
    await cache.delete("key1")
    const result = await cache.get("key1")
    expect(result).toBeNull()
  })

  it("should clear all entries", async () => {
    await cache.set("key1", "value1", 60)
    await cache.set("key2", "value2", 60)
    await cache.clear()
    expect(await cache.get("key1")).toBeNull()
    expect(await cache.get("key2")).toBeNull()
  })

  it("should not return expired entries", async () => {
    await cache.set("key1", "value", 0)
    await vi.advanceTimersByTimeAsync(100)
    const result = await cache.get("key1")
    expect(result).toBeNull()
  })
})

describe("cacheKey", () => {
  it("should generate correct cache keys", () => {
    expect(cacheKey("khan_academy", "search", "javascript")).toBe("courses:khan_academy:search:javascript")
    expect(cacheKey("mit_ocw", "getCourse", "123")).toBe("courses:mit_ocw:getCourse:123")
    expect(cacheKey("openedx", "getLessons", "c1", "s1")).toBe("courses:openedx:getLessons:c1:s1")
  })
})

describe("TTL constants", () => {
  it("should have correct TTL values", () => {
    expect(TTL.COURSE_CATALOG).toBe(3600)
    expect(TTL.COURSE_DETAILS).toBe(1800)
    expect(TTL.LESSON_STRUCTURES).toBe(900)
  })
})
