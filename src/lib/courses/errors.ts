export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly statusCode?: number,
    public readonly retryable: boolean = false
  ) {
    super(message)
    this.name = "ProviderError"
  }
}

export class ProviderTimeoutError extends ProviderError {
  constructor(provider: string) {
    super(`Provider ${provider} timed out`, provider, 408, true)
    this.name = "ProviderTimeoutError"
  }
}

export class ProviderRateLimitError extends ProviderError {
  constructor(provider: string, public readonly retryAfter?: number) {
    super(`Provider ${provider} rate limited`, provider, 429, true)
    this.name = "ProviderRateLimitError"
  }
}

export class ProviderUnavailableError extends ProviderError {
  constructor(provider: string) {
    super(`Provider ${provider} is unavailable`, provider, 503, true)
    this.name = "ProviderUnavailableError"
  }
}

export class InvalidResponseError extends ProviderError {
  constructor(provider: string, detail?: string) {
    super(
      `Invalid response from provider ${provider}${detail ? `: ${detail}` : ""}`,
      provider,
      502,
      false
    )
    this.name = "InvalidResponseError"
  }
}

export class CircuitBreakerOpenError extends ProviderError {
  constructor(provider: string) {
    super(`Circuit breaker open for provider ${provider}`, provider, 503, true)
    this.name = "CircuitBreakerOpenError"
  }
}

export interface ErrorResponse {
  error: string
  code: string
  provider?: string
  statusCode?: number
}

export function toErrorResponse(error: unknown): ErrorResponse {
  if (error instanceof ProviderError) {
    return {
      error: error.message,
      code: error.name,
      provider: error.provider,
      statusCode: error.statusCode,
    }
  }
  if (error instanceof Error) {
    return {
      error: "An unexpected error occurred",
      code: "INTERNAL_ERROR",
      statusCode: 500,
    }
  }
  return {
    error: "An unexpected error occurred",
    code: "INTERNAL_ERROR",
    statusCode: 500,
  }
}

export function sanitizeErrorMessage(message: string): string {
  return message.replace(/https?:\/\/[^\s]+/g, "[redacted]").replace(/(api[_-]?key|token|secret|password)=[^\s&]+/gi, "$1=[redacted]")
}
