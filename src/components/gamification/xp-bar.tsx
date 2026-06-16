"use client"

import { cn } from "@/lib/utils"

interface XpBarProps {
  xp: number
  level: number
  xpForNext: number
  className?: string
}

export function XpBar({ xp, level, xpForNext, className }: XpBarProps) {
  const progress = xpForNext > 0 ? Math.min((xp / xpForNext) * 100, 100) : 100

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-xs font-bold tabular-nums text-indigo-600 dark:text-indigo-400 min-w-[3rem]">
        Lv.{level}
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden min-w-[60px]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
