"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PremiumCardProps {
  children: ReactNode
  className?: string
  variant?: "default" | "gradient" | "glass" | "outlined" | "elevated"
  hover?: "lift" | "glow" | "scale" | "none"
  interactive?: boolean
}

export function PremiumCard({
  children,
  className,
  variant = "default",
  hover = "lift",
  interactive = true,
}: PremiumCardProps) {
  const variantStyles = {
    default:
      "border border-border/50 bg-card/50 backdrop-blur-sm",
    gradient:
      "border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-lg",
    glass:
      "border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10",
    outlined:
      "border-2 border-primary/20 bg-transparent hover:border-primary/40",
    elevated:
      "border border-border/30 bg-card shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10",
  }

  const hoverStyles = {
    lift: "transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10",
    glow: "transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 hover:bg-card/80",
    scale:
      "transition-transform duration-300 hover:scale-105 active:scale-95",
    none: "transition-colors duration-300",
  }

  return (
    <div
      className={cn(
        "group rounded-xl",
        variantStyles[variant],
        interactive && hoverStyles[hover],
        "animate-in",
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * Premium course card with gradient overlay
 */
interface CourseCardProps {
  thumbnail?: string
  title: string
  description: string
  instructor: {
    name: string
    image?: string
  }
  price?: number | null
  isFree?: boolean
  category?: string
  rating?: number
  enrollmentCount?: number
  onClick?: () => void
}

export function PremiumCourseCard({
  thumbnail,
  title,
  description,
  instructor,
  price,
  isFree,
  category,
  rating,
  enrollmentCount,
  onClick,
}: CourseCardProps) {
  return (
    <PremiumCard
      variant="gradient"
      hover="lift"
      className="overflow-hidden cursor-pointer"
      interactive={!!onClick}
    >
      <div onClick={onClick}>
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <svg
                className="h-12 w-12 text-white/50 group-hover:text-white/70 transition-colors"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Price badge */}
          {(isFree || price) && (
            <div className="absolute top-3 left-3 rounded-lg bg-black/40 backdrop-blur-md px-3 py-1 text-sm font-medium text-white border border-white/20">
              {isFree ? "Free" : `R${Number(price).toFixed(2)}`}
            </div>
          )}

          {/* Category badge */}
          {category && (
            <div className="absolute top-3 right-3 rounded-lg bg-background/80 backdrop-blur-md px-3 py-1 text-xs font-medium text-foreground border border-border/50">
              {category}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-4 p-5">
          {/* Title */}
          <h3 className="text-base font-semibold tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {description}
          </p>

          {/* Instructor */}
          <div className="flex items-center gap-3">
            {instructor.image ? (
              <img
                src={instructor.image}
                alt={instructor.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                {instructor.name[0]}
              </div>
            )}
            <span className="text-xs text-muted-foreground truncate">
              {instructor.name}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
            <div className="flex items-center gap-2">
              {rating !== undefined && rating > 0 && (
                <span className="flex items-center gap-1">
                  <span className="text-amber-500">★</span>
                  {rating.toFixed(1)}
                </span>
              )}
            </div>
            {enrollmentCount !== undefined && (
              <span>{enrollmentCount} enrolled</span>
            )}
          </div>
        </div>
      </div>
    </PremiumCard>
  )
}

/**
 * Premium stat card with icon
 */
interface StatCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  trend?: {
    value: number
    direction: "up" | "down"
  }
  variant?: "primary" | "success" | "warning" | "danger"
}

export function PremiumStatCard({
  label,
  value,
  icon,
  trend,
  variant = "primary",
}: StatCardProps) {
  const variantColors = {
    primary: "text-indigo-600 bg-indigo-600/10",
    success: "text-emerald-600 bg-emerald-600/10",
    warning: "text-amber-600 bg-amber-600/10",
    danger: "text-red-600 bg-red-600/10",
  }

  return (
    <PremiumCard variant="elevated" hover="glow" className="p-6">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {icon && (
          <div className={cn("rounded-lg p-2", variantColors[variant])}>
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        {trend && (
          <div
            className={cn(
              "text-xs font-medium flex items-center gap-1",
              trend.direction === "up"
                ? "text-emerald-600"
                : "text-red-600"
            )}
          >
            <span>
              {trend.direction === "up" ? "↑" : "↓"}
              {trend.value}%
            </span>
            <span className="text-muted-foreground">vs last month</span>
          </div>
        )}
      </div>
    </PremiumCard>
  )
}
