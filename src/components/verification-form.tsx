"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Shield, Search } from "lucide-react"

export function VerificationForm({ initialHash }: { initialHash: string }) {
  const [hash, setHash] = useState(initialHash)
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (hash.trim()) {
      router.push(`/verify?hash=${encodeURIComponent(hash.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={hash}
          onChange={(e) => setHash(e.target.value)}
          placeholder="Enter certificate hash..."
          className="w-full h-10 pl-10 pr-3 rounded-xl border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
      </div>
      <Button type="submit" disabled={!hash.trim()} className="btn-premium">
        <Search className="h-4 w-4 mr-1" /> Verify
      </Button>
    </form>
  )
}
