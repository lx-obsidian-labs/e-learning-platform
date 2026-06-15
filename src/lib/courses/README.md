# Course Aggregation Module

A provider-agnostic course aggregation engine using the **Strategy Pattern**. Aggregates courses from multiple free/open educational content providers through their public APIs.

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    REST API Layer                         │
│  GET /api/courses  GET /api/courses/[id]                  │
│  GET /api/courses/[id]/sections  GET /api/courses/[id]/lessons │
│  GET /api/courses/search?q=query                           │
└──────────────────────┬───────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────┐
│               CourseAggregationService                     │
│  - searchCourses()  - getCourse()  - getCourseStructure() │
│  - getLessons()  - searchAllProviders()  - searchByProvider()│
└────┬──────────┬──────────┬──────────┬────────────────────┘
     │          │          │          │
┌────▼──┐ ┌────▼──┐ ┌────▼──┐ ┌────▼──┐
│Khan    │ │MIT    │ │Open   │ │Open   │  ← Strategy Pattern
│Academy │ │OCW    │ │Learn  │ │edX    │  (CourseProvider interface)
└────┬───┘ └───────┘ └───────┘ └───────┘
     │
┌────▼──────────────────────────────────────────────────────┐
│                    Cache Layer                              │
│  InMemoryCacheProvider (replaceable via DI)                 │
│  TTL: catalog=1h, details=30m, lessons=15m                 │
└───────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│                 Circuit Breaker                            │
│  Per-provider: CLOSED → OPEN → HALF_OPEN                  │
│  Prevents cascading failures                               │
└───────────────────────────────────────────────────────────┘
```

## Provider Interface

```typescript
interface CourseProvider {
  readonly name: string
  searchCourses(query?: string): Promise<Course[]>
  getCourse(courseId: string): Promise<Course | null>
  getCourseStructure(courseId: string): Promise<Section[]>
  getLessons(courseId: string, sectionId?: string): Promise<Lesson[]>
}
```

## Unified Domain Models

### Course
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique provider-prefixed ID (e.g. `khan_abc123`) |
| provider | string | Provider name |
| providerCourseId | string | Original ID from provider |
| title | string | Course title |
| description | string | Course description |
| thumbnail | string? | Thumbnail URL |
| instructor | string? | Instructor name |
| category | string? | Category |
| language | string | Language code |
| level | "beginner" \| "intermediate" \| "advanced" \| "all" | Difficulty level |

### Section
| Field | Type | Description |
|-------|------|-------------|
| id | string | Section ID |
| title | string | Section title |
| position | number | Display order |

### Lesson
| Field | Type | Description |
|-------|------|-------------|
| id | string | Lesson ID |
| title | string | Lesson title |
| description | string? | Lesson description |
| contentType | "video" \| "article" \| "quiz" \| "pdf" \| "interactive" | Content type |
| contentUrl | string? | URL to content |
| duration | number? | Duration in seconds |
| position | number | Display order |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/courses` | List all courses (aggregated) |
| GET | `/api/courses?q=query` | Search courses across all providers |
| GET | `/api/courses?provider=name` | Filter by specific provider |
| GET | `/api/courses/:id` | Get course details |
| GET | `/api/courses/:id/sections` | Get course structure/sections |
| GET | `/api/courses/:id/lessons` | Get all lessons |
| GET | `/api/courses/:id/lessons?sectionId=section` | Get lessons by section |

### Course ID format
Courses use a prefixed ID format: `{provider}_{providerCourseId}`

Examples:
- `khan_x1234` → Khan Academy course
- `mit_18.01` → MIT OCW course
- `openlearn_5678` → OpenLearn course
- `edx_course-v1:MITx+18.01` → Open edX course

## Adding a New Provider

1. Create a file in `src/lib/courses/providers/`
2. Implement the `CourseProvider` interface
3. Register it in the API route handler

```typescript
import type { Course, Section, Lesson, CourseProvider } from "../types"
import { CircuitBreaker } from "../circuit-breaker"

export class MyProvider implements CourseProvider {
  readonly name = "my_provider"
  private breaker = new CircuitBreaker(this.name)

  async searchCourses(query?: string): Promise<Course[]> { /* ... */ }
  async getCourse(courseId: string): Promise<Course | null> { /* ... */ }
  async getCourseStructure(courseId: string): Promise<Section[]> { /* ... */ }
  async getLessons(courseId: string, sectionId?: string): Promise<Lesson[]> { /* ... */ }
}
```

Register in API route:
```typescript
const service = new CourseAggregationService()
service.registerProvider(new KhanAcademyProvider())
service.registerProvider(new MyProvider())  // ← Add this line
```

## Error Handling

All errors are wrapped in a unified response format:

```json
{
  "error": "Human-readable message",
  "code": "ProviderUnavailableError",
  "provider": "khan_academy",
  "statusCode": 503
}
```

Error types:
- `ProviderError` — base error
- `ProviderTimeoutError` (408) — request timed out
- `ProviderRateLimitError` (429) — rate limited
- `ProviderUnavailableError` (503) — provider is down
- `InvalidResponseError` (502) — bad response data
- `CircuitBreakerOpenError` (503) — circuit breaker open

## Caching

The `CacheProvider` interface allows any cache backend:

```typescript
interface CacheProvider {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
}
```

Default TTLs:
- Course catalog: 3600s (1 hour)
- Course details: 1800s (30 minutes)
- Lesson structures: 900s (15 minutes)

## Circuit Breaker

Per-provider circuit breaker with configurable thresholds:

```typescript
const config = {
  failureThreshold: 5,    // Failures before opening
  successThreshold: 2,    // Successes before closing
  timeoutMs: 30000,       // Time before half-open
  halfOpenMaxRequests: 1  // Requests allowed in half-open
}
```

States: `CLOSED` (normal) → `OPEN` (failing) → `HALF_OPEN` (probing) → `CLOSED` (recovered)

## Data Ownership

Only persisted in database:
- Course metadata (during import)
- User enrollments
- User progress
- Bookmarks
- Ratings
- Reviews
- Certificates

All lesson content, videos, assignments, quizzes, PDFs are fetched live from providers.

## Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

### Test files
| File | Tests | Description |
|------|-------|-------------|
| `cache.test.ts` | 8 | Cache get/set/expiry/clear |
| `circuit-breaker.test.ts` | 7 | Circuit breaker state machine |
| `errors.test.ts` | 12 | Error types and sanitization |
| `providers.test.ts` | 8 | Mock provider behavior |
| `aggregation.test.ts` | 16 | Service aggregation, isolation, search |

## Project Structure

```
src/lib/courses/
├── types.ts                   # Unified domain models & Provider interface
├── errors.ts                  # Error handling framework
├── cache.ts                   # Cache layer (DI-compatible)
├── circuit-breaker.ts         # Circuit breaker pattern
├── aggregation.ts             # Aggregation service
├── index.ts                   # Public API exports
├── providers/
│   ├── index.ts               # Provider registry
│   ├── khan-academy.ts        # Khan Academy provider
│   ├── mit-ocw.ts             # MIT OpenCourseWare provider
│   ├── open-learn.ts          # OpenLearn provider
│   └── openedx.ts             # Open edX provider
└── __tests__/
    ├── mock-provider.ts       # Mock provider for testing
    ├── cache.test.ts
    ├── circuit-breaker.test.ts
    ├── errors.test.ts
    ├── providers.test.ts
    └── aggregation.test.ts

src/app/api/courses/
├── route.ts                   # GET /api/courses (search/list)
├── [id]/route.ts              # GET /api/courses/:id
├── [id]/sections/route.ts     # GET /api/courses/:id/sections
└── [id]/lessons/route.ts      # GET /api/courses/:id/lessons
```
