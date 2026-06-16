"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Group = {
  id: string
  name: string
  description?: string | null
  courseId?: string | null
  memberCount: number
  isPublic: boolean
  createdAt: string
}

export function GroupCard({
  group,
  onJoin,
}: {
  group: Group
  onJoin?: () => void
}) {
  return (
    <Card variant="pro" className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{group.name}</CardTitle>
          <Badge variant={group.isPublic ? "default" : "secondary"} className="shrink-0">
            {group.isPublic ? "Public" : "Private"}
          </Badge>
        </div>
        {group.description && (
          <CardDescription className="line-clamp-2">
            {group.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-end gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>👥</span>
          <span>{group.memberCount} member{group.memberCount !== 1 ? "s" : ""}</span>
        </div>
        {onJoin ? (
          <Button onClick={onJoin} size="sm">
            Join Group
          </Button>
        ) : (
          <Button asChild variant="outline" size="sm">
            <Link href={`/groups/${group.id}`}>View Group</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
