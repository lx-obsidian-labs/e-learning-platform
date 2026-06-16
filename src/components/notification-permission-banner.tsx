"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useBrowserNotification } from "@/hooks/use-browser-notification"

export function NotificationPermissionBanner() {
  const { permission, requestPermission } = useBrowserNotification()
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("notif-banner-dismissed")
    if (stored !== "true") {
      setDismissed(false)
    }
  }, [])

  if (permission !== "default" || dismissed) return null

  const handleEnable = async () => {
    await requestPermission()
  }

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem("notif-banner-dismissed", "true")
  }

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div className="rounded-xl border border-white/20 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-lg p-4 flex items-center gap-3">
        <span className="text-lg">🔔</span>
        <p className="text-sm text-foreground flex-1">
          Enable desktop notifications for important updates
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" onClick={handleEnable}>
            Enable
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDismiss}>
            No thanks
          </Button>
        </div>
      </div>
    </div>
  )
}
