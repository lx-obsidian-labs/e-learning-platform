"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PremiumBadgeProps {
  children: ReactNode
  variant?:
    | "default"
    | "primary"
    | "success"
    | "warning"
    | "danger"
    | "info"
  size?: "sm" | "md" | "lg"
  icon?: ReactNode
  removable?: boolean
  onRemove?: () => void
  className?: string
}

export function PremiumBadge({
  children,
  variant = "default",
  size = "md",
  icon,
  removable = false,
  onRemove,
  className,
}: PremiumBadgeProps) {
  const variantStyles = {
    default:
      "bg-muted text-foreground",
    primary:
      "bg-indigo-600/20 text-indigo-600 border border-indigo-600/30",
    success:
      "bg-emerald-600/20 text-emerald-600 border border-emerald-600/30",
    warning:
      "bg-amber-600/20 text-amber-600 border border-amber-600/30",
    danger:
      "bg-red-600/20 text-red-600 border border-red-600/30",
    info: "bg-blue-600/20 text-blue-600 border border-blue-600/30",
  }

  const sizeStyles = {
    sm: "px-2 py-1 text-xs font-medium",
    md: "px-3 py-1.5 text-sm font-medium",
    lg: "px-4 py-2 text-base font-medium",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full",
        "transition-all duration-200",
        variantStyles[variant],
        sizeStyles[size],
        "animate-in",
        className
      )}
    >
      {icon && <span>{icon}</span>}
      <span>{children}</span>
      {removable && (
        <button
          onClick={onRemove}
          className="ml-1 hover:opacity-70 transition-opacity"
          aria-label="Remove"
        >
          ×
        </button>
      )}
    </div>
  )
}

/**
 * Achievement badge with glow effect
 */
interface AchievementBadgeProps {
  icon: ReactNode
  label: string
  unlocked?: boolean
}

export function AchievementBadge({
  icon,
  label,
  unlocked = true,
}: AchievementBadgeProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "relative",
          "rounded-full p-4",
          "transition-all duration-300",
          unlocked
            ? "bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/50 animate-glow"
            : "bg-muted text-muted-foreground opacity-50"
        )}
      >
        <div className="text-2xl">{icon}</div>
      </div>
      <p className="text-xs font-semibold text-center max-w-[80px] line-clamp-2">
        {label}
      </p>
    </div>
  )
}
