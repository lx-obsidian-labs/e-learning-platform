"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getUnreadCount, getNotifications, markAsRead, markAllAsRead } from "@/actions/notifications"
import type { Notification } from "@/types/notifications"
import { Bell } from "lucide-react"
import { useBrowserNotification } from "@/hooks/use-browser-notification"

export function NotificationBell() {
  const [unread, setUnread] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const { showNotification } = useBrowserNotification()
  const lastUnreadRef = useRef(0)

  const refresh = useCallback(async () => {
    const [count, items] = await Promise.all([
      getUnreadCount(),
      getNotifications(),
    ])

    if (count > lastUnreadRef.current && items.length > 0) {
      const latest = items[0]
      showNotification(latest.title, { body: latest.message })
    }
    lastUnreadRef.current = count

    setUnread(count)
    setNotifications(items)
  }, [showNotification])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 30000)
    return () => clearInterval(interval)
  }, [refresh])

  async function handleMarkRead(id: string) {
    await markAsRead(id)
    refresh()
  }

  async function handleMarkAllRead() {
    await markAllAsRead()
    refresh()
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between px-2 py-1.5 border-b">
          <span className="text-sm font-semibold">Notifications</span>
          {unread > 0 && (
            <button onClick={handleMarkAllRead} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
              Mark all read
            </button>
          )}
        </div>
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          notifications.slice(0, 10).map((n) => (
            <DropdownMenuItem
              key={n.id}
              className={`flex flex-col items-start gap-0.5 px-3 py-2.5 cursor-pointer ${!n.read ? "bg-indigo-50/50 dark:bg-indigo-950/30" : ""}`}
              onClick={() => handleMarkRead(n.id)}
            >
              <div className="flex items-center gap-2 w-full">
                <span className={`text-sm font-medium ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>
                  {n.title}
                </span>
                {!n.read && <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0" />}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
              <span className="text-[10px] text-muted-foreground/60 mt-0.5">
                {formatTimeAgo(n.createdAt)}
              </span>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="justify-center text-sm font-medium">
          <Link href="/notifications" onClick={() => setOpen(false)}>
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
