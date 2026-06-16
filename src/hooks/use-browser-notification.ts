"use client"

import { useState, useEffect, useCallback } from "react"

export function useBrowserNotification() {
  const [permission, setPermission] = useState<NotificationPermission>("default")

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return "denied" as NotificationPermission
    const result = await Notification.requestPermission()
    setPermission(result)
    return result
  }, [])

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!("Notification" in window) || Notification.permission !== "granted") return
    if (document.visibilityState === "visible") return
    const notification = new Notification(title, {
      icon: "/icons/icon-192.svg",
      badge: "/icons/icon-192.svg",
      ...options,
    })
    notification.onclick = () => {
      window.focus()
      notification.close()
    }
  }, [])

  return { permission, requestPermission, showNotification }
}
