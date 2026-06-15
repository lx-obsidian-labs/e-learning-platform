"use client"

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground">Something went wrong</h1>
        <p className="mt-2 text-muted-foreground">{error.message || "A server error occurred."}</p>
        <button onClick={reset} className="mt-4 rounded-lg bg-primary px-4 py-2 text-primary-foreground">
          Try again
        </button>
      </div>
    </div>
  )
}
