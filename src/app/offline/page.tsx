import Link from "next/link"

export default function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-6xl">📡</div>
      <h1 className="mb-2 text-3xl font-bold">You&apos;re offline</h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        It looks like you&apos;ve lost your internet connection. Please check your
        network and try again.
      </p>
      <Link
        href="/"
        className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80"
      >
        Try Again
      </Link>
    </div>
  )
}
