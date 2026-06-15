import { describe, it, expect } from "vitest"
import {
  ProviderError,
  ProviderTimeoutError,
  ProviderRateLimitError,
  ProviderUnavailableError,
  InvalidResponseError,
  CircuitBreakerOpenError,
  toErrorResponse,
  sanitizeErrorMessage,
} from "../errors"

describe("Provider Errors", () => {
  it("should create ProviderError with correct properties", () => {
    const err = new ProviderError("Something went wrong", "khan_academy", 500, true)
    expect(err.message).toBe("Something went wrong")
    expect(err.provider).toBe("khan_academy")
    expect(err.statusCode).toBe(500)
    expect(err.retryable).toBe(true)
    expect(err.name).toBe("ProviderError")
  })

  it("should create ProviderTimeoutError with defaults", () => {
    const err = new ProviderTimeoutError("khan_academy")
    expect(err.provider).toBe("khan_academy")
    expect(err.statusCode).toBe(408)
    expect(err.retryable).toBe(true)
    expect(err.name).toBe("ProviderTimeoutError")
  })

  it("should create ProviderRateLimitError with retryAfter", () => {
    const err = new ProviderRateLimitError("mit_ocw", 120)
    expect(err.provider).toBe("mit_ocw")
    expect(err.statusCode).toBe(429)
    expect(err.retryable).toBe(true)
    expect(err.retryAfter).toBe(120)
  })

  it("should create ProviderUnavailableError", () => {
    const err = new ProviderUnavailableError("openedx")
    expect(err.provider).toBe("openedx")
    expect(err.statusCode).toBe(503)
    expect(err.retryable).toBe(true)
  })

  it("should create InvalidResponseError", () => {
    const err = new InvalidResponseError("openlearn", "missing data")
    expect(err.provider).toBe("openlearn")
    expect(err.statusCode).toBe(502)
    expect(err.retryable).toBe(false)
  })

  it("should create CircuitBreakerOpenError", () => {
    const err = new CircuitBreakerOpenError("khan_academy")
    expect(err.provider).toBe("khan_academy")
    expect(err.statusCode).toBe(503)
    expect(err.retryable).toBe(true)
  })
})

describe("toErrorResponse", () => {
  it("should convert ProviderError to ErrorResponse", () => {
    const err = new ProviderError("test msg", "khan", 503, true)
    const resp = toErrorResponse(err)
    expect(resp).toEqual({
      error: "test msg",
      code: "ProviderError",
      provider: "khan",
      statusCode: 503,
    })
  })

  it("should sanitize generic Error", () => {
    const err = new Error("something broke")
    const resp = toErrorResponse(err)
    expect(resp).toEqual({
      error: "An unexpected error occurred",
      code: "INTERNAL_ERROR",
      statusCode: 500,
    })
  })

  it("should handle unknown errors", () => {
    const resp = toErrorResponse("string error")
    expect(resp).toEqual({
      error: "An unexpected error occurred",
      code: "INTERNAL_ERROR",
      statusCode: 500,
    })
  })

  it("should not expose provider details in generic errors", () => {
    const err = new Error("Database connection failed at https://internal-db.example.com")
    const resp = toErrorResponse(err)
    expect(resp.error).not.toContain("internal-db")
  })
})

describe("sanitizeErrorMessage", () => {
  it("should redact URLs", () => {
    const result = sanitizeErrorMessage("Error at https://example.com/api/v1/courses")
    expect(result).toContain("[redacted]")
    expect(result).not.toContain("example.com")
  })

  it("should redact API keys in query strings", () => {
    const result = sanitizeErrorMessage("Invalid response: api_key=sk-12345&token=abc")
    expect(result).toContain("api_key=[redacted]")
    expect(result).toContain("token=[redacted]")
    expect(result).not.toContain("sk-12345")
  })
})
