"use client"

import { useEffect, useState, useCallback } from "react"
import { getNotifications, markAsRead, markAllAsRead } from "@/actions/notifications"
import type { Notification } from "@/types/notifications"
import { Button } from "@/components/ui/button"
import { CheckCheck, Bell } from "lucide-react"

export function NotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const items = await getNotifications()
    setNotifications(items)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function handleMarkRead(id: string) {
    await markAsRead(id)
    refresh()
  }

  async function handleMarkAllRead() {
    await markAllAsRead()
    refresh()
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Bell className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground">No notifications yet</h3>
        <p className="text-sm text-muted-foreground/60 mt-1">Notifications will appear here as you learn</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
        </p>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-indigo-600 dark:text-indigo-400">
            <CheckCheck className="h-4 w-4 mr-1.5" />
            Mark all as read
          </Button>
        )}
      </div>
      <div className="space-y-1">
        {notifications.map((n) => (
          <button
            key={n.id}
            onClick={() => handleMarkRead(n.id)}
            className={`w-full text-left rounded-lg border p-4 transition-colors hover:bg-accent/50 ${
              !n.read
                ? "border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30"
                : "border-border bg-card"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>
                    {n.title}
                  </span>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0" />}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                <span className="text-xs text-muted-foreground/60 mt-1 block">
                  {formatTimeAgo(n.createdAt)}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function formatTimeAgo(dateString: string) {
  const now = Date.now()
  const date = new Date(dateString).getTime()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(dateString).toLocaleDateString()
}
