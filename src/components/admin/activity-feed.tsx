"use client"

import { UserPlus, BookOpen, Users, FileText, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Activity = { type: string; description: string; timestamp: string }

function formatRelativeTime(dateStr: string) {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diffMs = now - date
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return "just now"
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
  return new Date(dateStr).toLocaleDateString()
}

const iconMap: Record<string, typeof Activity> = {
  enrollment: UserPlus,
  lesson: BookOpen,
  user: Users,
  course: FileText,
}

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground py-8">
          No recent activity
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {activities.map((a, i) => {
          const Icon = iconMap[a.type] || Activity
          return (
            <div key={i} className="flex items-start gap-3 py-2 border-b last:border-0">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{a.description}</p>
                <p className="text-xs text-muted-foreground">
                  {formatRelativeTime(a.timestamp)}
                </p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
