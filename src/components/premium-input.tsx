"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PremiumInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
  iconPosition?: "left" | "right"
  fullWidth?: boolean
}

export function PremiumInput({
  label,
  error,
  hint,
  icon,
  iconPosition = "left",
  fullWidth = true,
  className,
  ...props
}: PremiumInputProps) {
  return (
    <div className={cn("space-y-2", fullWidth && "w-full")}>
      {label && (
        <label className="text-sm font-medium text-foreground block">
          {label}
        </label>
      )}

      <div className="relative">
        {icon && iconPosition === "left" && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground pointer-events-none">
            {icon}
          </div>
        )}

        <input
          className={cn(
            "w-full rounded-lg border-2 border-border/50",
            "bg-card/50 backdrop-blur-sm",
            "px-4 py-3 text-base",
            "transition-all duration-200",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
            "hover:border-border",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            icon && iconPosition === "left" && "pl-12",
            icon && iconPosition === "right" && "pr-12",
            error && "border-red-500/50 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          {...props}
        />

        {icon && iconPosition === "right" && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground pointer-events-none">
            {icon}
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs font-medium text-red-600 flex items-center gap-1">
          <span>✕</span> {error}
        </p>
      )}

      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}

/**
 * Floating label input for premium feel
 */
interface FloatingLabelInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function FloatingLabelInput({
  label,
  error,
  id,
  className,
  ...props
}: FloatingLabelInputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-")

  return (
    <div className="relative group">
      <input
        id={inputId}
        className={cn(
          "w-full px-4 py-3 rounded-lg",
          "border-2 border-border/50 bg-card/50 backdrop-blur-sm",
          "text-foreground",
          "transition-all duration-200",
          "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
          "peer",
          "placeholder-transparent",
          error && "border-red-500/50 focus:border-red-500",
          className
        )}
        placeholder={label}
        {...props}
      />
      <label
        htmlFor={inputId}
        className={cn(
          "absolute left-4 top-3.5",
          "text-muted-foreground text-base",
          "transition-all duration-200",
          "pointer-events-none",
          "peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base",
          "peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary",
          "peer-focus:font-medium",
          `peer-[&:not(:placeholder-shown)]:top-1`,
          `peer-[&:not(:placeholder-shown)]:text-xs`,
          `peer-[&:not(:placeholder-shown)]:text-muted-foreground`
        )}
      >
        {label}
      </label>
      {error && (
        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
          <span>✕</span> {error}
        </p>
      )}
    </div>
  )
}
