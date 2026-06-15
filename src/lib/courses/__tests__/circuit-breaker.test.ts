import { describe, it, expect, vi } from "vitest"
import { CircuitBreaker } from "../circuit-breaker"

describe("CircuitBreaker", () => {
  it("should start in CLOSED state", () => {
    const cb = new CircuitBreaker("test")
    expect(cb.getState()).toBe("CLOSED")
  })

  it("should transition to OPEN after failures exceed threshold", async () => {
    const cb = new CircuitBreaker("test", {
      failureThreshold: 3,
      successThreshold: 1,
      timeoutMs: 5000,
      halfOpenMaxRequests: 1,
    })

    const failingFn = async () => { throw new Error("fail") }
    for (let i = 0; i < 3; i++) {
      await expect(cb.call(failingFn)).rejects.toThrow("fail")
    }
    expect(cb.getState()).toBe("OPEN")
  })

  it("should reject calls when OPEN", async () => {
    const cb = new CircuitBreaker("test", {
      failureThreshold: 1,
      successThreshold: 1,
      timeoutMs: 50000,
      halfOpenMaxRequests: 1,
    })

    await expect(cb.call(async () => { throw new Error("fail") })).rejects.toThrow("fail")
    expect(cb.getState()).toBe("OPEN")

    await expect(cb.call(async () => "ok")).rejects.toThrow("Circuit breaker open")
  })

  it("should transition to HALF_OPEN after timeout", async () => {
    vi.useFakeTimers()
    const cb = new CircuitBreaker("test", {
      failureThreshold: 1,
      successThreshold: 1,
      timeoutMs: 10000,
      halfOpenMaxRequests: 1,
    })

    await expect(cb.call(async () => { throw new Error("fail") })).rejects.toThrow("fail")
    expect(cb.getState()).toBe("OPEN")

    vi.advanceTimersByTime(10000)
    expect(cb.getState()).toBe("HALF_OPEN")
    vi.useRealTimers()
  })

  it("should return to CLOSED after success in HALF_OPEN", async () => {
    vi.useFakeTimers()
    const cb = new CircuitBreaker("test", {
      failureThreshold: 1,
      successThreshold: 1,
      timeoutMs: 10000,
      halfOpenMaxRequests: 1,
    })

    await expect(cb.call(async () => { throw new Error("fail") })).rejects.toThrow("fail")
    vi.advanceTimersByTime(10000)

    await cb.call(async () => "success")
    expect(cb.getState()).toBe("CLOSED")
    vi.useRealTimers()
  })

  it("should return to OPEN after failure in HALF_OPEN", async () => {
    vi.useFakeTimers()
    const cb = new CircuitBreaker("test", {
      failureThreshold: 1,
      successThreshold: 1,
      timeoutMs: 10000,
      halfOpenMaxRequests: 1,
    })

    await expect(cb.call(async () => { throw new Error("fail") })).rejects.toThrow("fail")
    vi.advanceTimersByTime(10000)

    await expect(cb.call(async () => { throw new Error("fail again") })).rejects.toThrow("fail again")
    expect(cb.getState()).toBe("OPEN")
    vi.useRealTimers()
  })

  it("should return stats", () => {
    const cb = new CircuitBreaker("test")
    const stats = cb.getStats()
    expect(stats).toHaveProperty("state")
    expect(stats).toHaveProperty("failures")
    expect(stats).toHaveProperty("successes")
    expect(stats).toHaveProperty("total")
    expect(stats).toHaveProperty("lastFailureTime")
  })
})
