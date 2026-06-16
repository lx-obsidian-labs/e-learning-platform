"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

const DISMISS_KEY = "pwa-prompt-dismissed"
const DISMISS_DURATION = 30 * 24 * 60 * 60 * 1000

export function PwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(true)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(DISMISS_KEY)
    if (stored) {
      const elapsed = Date.now() - Number(stored)
      if (elapsed < DISMISS_DURATION) return
      localStorage.removeItem(DISMISS_KEY)
    }
    setDismissed(false)

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return
    }

    const iOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsIOS(iOS)

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener("beforeinstallprompt", handler)

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  if (isInstalled || dismissed) return null

  const handleInstall = () => {
    if (!deferredPrompt) return
    ;(deferredPrompt as any).prompt()
    ;(deferredPrompt as any).userChoice.then(() => setDeferredPrompt(null))
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setDismissed(true)
  }

  return (
    <div className="glass-nav fixed bottom-0 left-0 right-0 z-50 border-t p-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {isIOS
            ? "Install Edu Learn: tap the Share button and select 'Add to Home Screen'."
            : "Install Edu Learn for the best experience."}
        </p>
        <div className="flex shrink-0 gap-2">
          {!isIOS && deferredPrompt && (
            <Button size="sm" onClick={handleInstall}>
              Install
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  )
}
