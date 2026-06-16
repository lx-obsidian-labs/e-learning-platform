"use client"

import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PremiumButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?:
    | "premium"
    | "gradient"
    | "glass"
    | "outline-premium"
    | "success"
    | "danger"
  size?: "sm" | "md" | "lg" | "xl"
  icon?: ReactNode
  iconPosition?: "left" | "right"
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
}

export function PremiumButton({
  children,
  variant = "premium",
  size = "md",
  icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  fullWidth = false,
  className,
  ...props
}: PremiumButtonProps) {
  const variantStyles = {
    premium:
      "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40",
    gradient:
      "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40",
    glass:
      "bg-white/10 backdrop-blur-md border border-white/20 text-foreground hover:bg-white/20 hover:border-white/30",
    "outline-premium":
      "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600/10",
    success:
      "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/30",
    danger:
      "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg shadow-red-500/30",
  }

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm gap-2",
    md: "px-4 py-2 text-base gap-2",
    lg: "px-6 py-3 text-base gap-2",
    xl: "px-8 py-4 text-lg gap-3",
  }

  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-semibold rounded-lg",
        "transition-all duration-200 transform",
        "hover:scale-105 active:scale-95",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        "animate-in",
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </span>
      ) : (
        <>
          {icon && iconPosition === "left" && icon}
          {children}
          {icon && iconPosition === "right" && icon}
        </>
      )}
    </button>
  )
}

/**
 * Icon button with hover effects
 */
interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode
  size?: "sm" | "md" | "lg"
  variant?: "default" | "ghost" | "outline" | "premium"
}

export function IconButton({
  icon,
  size = "md",
  variant = "ghost",
  className,
  ...props
}: IconButtonProps) {
  const sizeStyles = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  const variantStyles = {
    default:
      "bg-muted hover:bg-muted/80 text-foreground",
    ghost:
      "hover:bg-muted text-foreground",
    outline:
      "border border-border hover:bg-muted",
    premium:
      "bg-primary/10 text-primary hover:bg-primary/20",
  }

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg",
        "transition-all duration-200",
        "hover:scale-110 active:scale-95",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {icon}
    </button>
  )
}
