export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN"

export interface CircuitBreakerConfig {
  failureThreshold: number
  successThreshold: number
  timeoutMs: number
  halfOpenMaxRequests: number
}

export const defaultConfig: CircuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 2,
  timeoutMs: 30000,
  halfOpenMaxRequests: 1,
}

interface Bucket {
  failures: number
  successes: number
  total: number
  lastFailureTime: number
}

export class CircuitBreaker {
  private state: CircuitState = "CLOSED"
  private bucket: Bucket = { failures: 0, successes: 0, total: 0, lastFailureTime: 0 }
  private openTimer: ReturnType<typeof setTimeout> | null = null
  private halfOpenRequests = 0

  constructor(
    public readonly name: string,
    private config: CircuitBreakerConfig = defaultConfig
  ) {}

  getState(): CircuitState {
    return this.state
  }

  getStats(): { state: CircuitState } & Bucket {
    return { state: this.state, ...this.bucket }
  }

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() - this.bucket.lastFailureTime >= this.config.timeoutMs) {
        this.transitionTo("HALF_OPEN")
      } else {
        throw this.createOpenError()
      }
    }

    if (this.state === "HALF_OPEN" && this.halfOpenRequests >= this.config.halfOpenMaxRequests) {
      throw this.createOpenError()
    }

    try {
      this.halfOpenRequests++
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    } finally {
      this.halfOpenRequests--
    }
  }

  private onSuccess(): void {
    this.bucket.successes++
    this.bucket.total++

    if (this.state === "HALF_OPEN" && this.bucket.successes >= this.config.successThreshold) {
      this.transitionTo("CLOSED")
    }
  }

  private onFailure(): void {
    this.bucket.failures++
    this.bucket.total++
    this.bucket.lastFailureTime = Date.now()

    if (this.state === "HALF_OPEN") {
      this.transitionTo("OPEN")
      return
    }

    if (this.state === "CLOSED" && this.bucket.failures >= this.config.failureThreshold) {
      this.transitionTo("OPEN")
    }
  }

  private transitionTo(state: CircuitState): void {
    this.state = state
    if (state === "CLOSED") {
      this.bucket = { failures: 0, successes: 0, total: 0, lastFailureTime: 0 }
    }
    if (state === "OPEN") {
      this.openTimer = setTimeout(() => {
        if (this.state === "OPEN") this.transitionTo("HALF_OPEN")
      }, this.config.timeoutMs)
    }
    if (state === "HALF_OPEN") {
      this.bucket.successes = 0
      if (this.openTimer) {
        clearTimeout(this.openTimer)
        this.openTimer = null
      }
    }
  }

  private createOpenError(): Error {
    const err = new Error(`Circuit breaker open for ${this.name}`)
    err.name = "CircuitBreakerOpenError"
    return err
  }
}
