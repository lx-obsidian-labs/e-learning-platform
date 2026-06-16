import Link from "next/link"
import { WifiOff } from "lucide-react"

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center pt-16 sm:pt-20">
      <div className="glass-card-strong rounded-2xl p-12 max-w-md mx-auto space-y-6">
        <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center">
          <WifiOff className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">You&apos;re offline</h1>
        <p className="text-muted-foreground">
          It looks like you&apos;ve lost your internet connection. Check your network and try again.
        </p>
        <Link
          href="/"
          className="btn-premium inline-flex h-10 items-center justify-center rounded-lg px-6 text-sm font-medium"
        >
          Try Again
        </Link>
      </div>
    </div>
  )
}
