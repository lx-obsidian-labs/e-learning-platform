export { CourseAggregationService, getDefaultAggregationService } from "./aggregation"
export type { Course, Section, Lesson, CourseProvider, ProviderConfig, SearchResult } from "./types"
export { InMemoryCacheProvider, TTL, cacheKey } from "./cache"
export type { CacheProvider } from "./cache"
export { CircuitBreaker, defaultConfig } from "./circuit-breaker"
export type { CircuitBreakerConfig, CircuitState } from "./circuit-breaker"
export {
  ProviderError,
  ProviderTimeoutError,
  ProviderRateLimitError,
  ProviderUnavailableError,
  InvalidResponseError,
  CircuitBreakerOpenError,
  toErrorResponse,
  sanitizeErrorMessage,
} from "./errors"
export type { ErrorResponse } from "./errors"
export { KhanAcademyProvider } from "./providers/khan-academy"
export { MITOCWProvider } from "./providers/mit-ocw"
export { OpenLearnProvider } from "./providers/open-learn"
export { OpenEdxProvider } from "./providers/openedx"
export { registerProvider, getAllProviders, getProvider } from "./providers"
