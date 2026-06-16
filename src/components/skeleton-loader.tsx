"use client"

import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
  variant?: "text" | "rounded" | "circular"
  width?: string | number
  height?: string | number
  count?: number
  animated?: boolean
}

export function Skeleton({
  className,
  variant = "rounded",
  width,
  height = 24,
  count = 1,
  animated = true,
}: SkeletonProps) {
  const widthStyle = width ? (typeof width === "number" ? `${width}px` : width) : "100%"
  const heightStyle = typeof height === "number" ? `${height}px` : height

  const baseClass = cn(
    "bg-muted",
    animated && "animate-skeleton",
    {
      "rounded-md": variant === "rounded",
      "rounded-lg": variant === "rounded" && !className?.includes("rounded"),
      "rounded-full": variant === "circular",
    },
    className
  )

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={baseClass}
          style={{
            width: widthStyle,
            height: heightStyle,
          }}
        />
      ))}
    </>
  )
}

/**
 * Skeleton for course cards
 */
export function CourseCardSkeleton() {
  return (
    <div className="space-y-4 rounded-lg border border-border/50 bg-card/50 p-4">
      {/* Thumbnail */}
      <Skeleton variant="rounded" height={200} className="w-full" />

      {/* Title */}
      <Skeleton height={20} className="w-3/4" />

      {/* Description lines */}
      <div className="space-y-2">
        <Skeleton height={16} className="w-full" />
        <Skeleton height={16} className="w-5/6" />
      </div>

      {/* Instructor info */}
      <div className="flex items-center gap-3 pt-2">
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton height={14} className="w-24" />
      </div>

      {/* Footer stats */}
      <div className="flex justify-between">
        <Skeleton height={14} className="w-16" />
        <Skeleton height={14} className="w-20" />
      </div>
    </div>
  )
}

/**
 * Skeleton for dashboard stat cards
 */
export function StatCardSkeleton() {
  return (
    <div className="space-y-3 rounded-lg border border-border/50 bg-card/50 p-6">
      <div className="flex items-start justify-between">
        <Skeleton height={16} className="w-24" />
        <Skeleton variant="circular" width={40} height={40} />
      </div>
      <Skeleton height={28} className="w-32" />
      <Skeleton height={12} className="w-20" />
    </div>
  )
}

/**
 * Skeleton for lesson content
 */
export function LessonSkeleton() {
  return (
    <div className="space-y-6">
      {/* Video placeholder */}
      <Skeleton variant="rounded" height={400} className="w-full" />

      {/* Lesson title and meta */}
      <div className="space-y-3">
        <Skeleton height={28} className="w-3/4" />
        <Skeleton height={14} className="w-1/2" />
      </div>

      {/* Content lines */}
      <div className="space-y-3">
        <Skeleton height={16} className="w-full" />
        <Skeleton height={16} className="w-full" />
        <Skeleton height={16} className="w-4/5" />
      </div>

      {/* Quiz section */}
      <div className="space-y-3 border-t pt-6">
        <Skeleton height={20} className="w-32" />
        <Skeleton height={14} className="w-full" />
        <Skeleton height={14} className="w-full" />
      </div>
    </div>
  )
}

/**
 * Skeleton for user profile
 */
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Profile header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton variant="circular" width={80} height={80} />
          <div className="flex-1 space-y-2">
            <Skeleton height={24} className="w-40" />
            <Skeleton height={14} className="w-32" />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
