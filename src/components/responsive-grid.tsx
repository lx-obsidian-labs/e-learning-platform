"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ResponsiveGridProps {
  children: ReactNode
  className?: string
  gap?: "xs" | "sm" | "md" | "lg" | "xl"
  cols?: {
    mobile?: number
    tablet?: number
    desktop?: number
    wide?: number
  }
}

export function ResponsiveGrid({
  children,
  className,
  gap = "lg",
  cols = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
    wide: 4,
  },
}: ResponsiveGridProps) {
  const gapMap = {
    xs: "gap-2",
    sm: "gap-3",
    md: "gap-4",
    lg: "gap-6",
    xl: "gap-8",
  }

  const colsMap = {
    mobile: `grid-cols-${cols.mobile || 1}`,
    tablet: `sm:grid-cols-${cols.tablet || 2}`,
    desktop: `md:grid-cols-${cols.desktop || 3}`,
    wide: `lg:grid-cols-${cols.wide || 4}`,
  }

  return (
    <div
      className={cn(
        "grid w-full auto-rows-max",
        `grid-cols-${cols.mobile || 1}`,
        `sm:grid-cols-${cols.tablet || 2}`,
        `md:grid-cols-${cols.desktop || 3}`,
        `lg:grid-cols-${cols.wide || 4}`,
        gapMap[gap],
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * Responsive card wrapper with consistent spacing
 */
interface ResponsiveCardProps {
  children: ReactNode
  className?: string
  animate?: boolean
}

export function ResponsiveCard({
  children,
  className,
  animate = true,
}: ResponsiveCardProps) {
  return (
    <div
      className={cn(
        "group rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-primary/5",
        animate && "animate-in",
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * Mobile-optimized container
 */
interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
}

export function ResponsiveContainer({
  children,
  className,
  maxWidth = "lg",
}: ResponsiveContainerProps) {
  const maxWidthMap = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full",
  }

  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        maxWidthMap[maxWidth],
        className
      )}
    >
      {children}
    </div>
  )
}
