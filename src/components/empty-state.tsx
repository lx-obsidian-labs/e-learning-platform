"use client"

import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import * as LucideIcons from "lucide-react"

interface EmptyStateProps {
  icon?: keyof typeof LucideIcons | ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: "default" | "outline" | "secondary" | "ghost"
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
  children?: ReactNode
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  children,
}: EmptyStateProps) {
  const IconComponent =
    icon && typeof icon === "string" && icon in LucideIcons
      ? (LucideIcons[icon as keyof typeof LucideIcons] as any)
      : null

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6 rounded-lg border border-dashed border-border/50 bg-gradient-to-b from-muted/50 to-muted/20 px-6 py-16 text-center sm:py-20",
        className
      )}
    >
      {/* Icon */}
      {IconComponent && (
        <div className="rounded-full bg-muted p-4">
          <IconComponent className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      {icon && typeof icon !== "string" && (
        <div className="rounded-full bg-muted p-4">{icon}</div>
      )}

      {/* Content */}
      <div className="max-w-sm space-y-2">
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Custom children */}
      {children}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col gap-3 sm:flex-row">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || "default"}
              size="sm"
              className="animate-in"
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="outline"
              size="sm"
              className="animate-in"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Empty state variants for common scenarios
 */

export function EmptyNoEnrollments() {
  return (
    <EmptyState
      icon="BookOpen"
      title="No courses yet"
      description="Browse our collection of courses and start learning today."
      action={{
        label: "Browse Courses",
        onClick: () => (window.location.href = "/courses"),
      }}
    />
  )
}

export function EmptyNoResults() {
  return (
    <EmptyState
      icon="Search"
      title="No results found"
      description="Try adjusting your search criteria or filters."
    />
  )
}

export function EmptyNoGroups() {
  return (
    <EmptyState
      icon="Users"
      title="No study groups"
      description="Create a study group to collaborate with other learners."
      action={{
        label: "Create Group",
        onClick: () => (window.location.href = "/groups/create"),
      }}
    />
  )
}

export function EmptyNoCertificates() {
  return (
    <EmptyState
      icon="Award"
      title="No certificates yet"
      description="Complete a course to earn your first certificate."
      action={{
        label: "Explore Courses",
        onClick: () => (window.location.href = "/courses"),
      }}
    />
  )
}

export function EmptyNoActivity() {
  return (
    <EmptyState
      icon="Activity"
      title="No activity yet"
      description="Get started by enrolling in a course."
    />
  )
}

export function EmptySearchResults() {
  return (
    <EmptyState
      icon="SearchX"
      title="No courses found"
      description="We couldn't find any courses matching your search. Try different keywords."
    />
  )
}
