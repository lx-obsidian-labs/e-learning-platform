"use client"

import { cn } from "@/lib/utils"

interface StreakIndicatorProps {
  currentStreak: number
  className?: string
}

export function StreakIndicator({ currentStreak, className }: StreakIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-1.5 text-sm font-medium", className)}>
      <span className="text-lg">🔥</span>
      <span className="tabular-nums">{currentStreak}</span>
      <span className="text-muted-foreground">day streak</span>
    </div>
  )
}
