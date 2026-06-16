"use client"

import { ReactNode } from "react"
import { MobileNavigation, MobileNavSpacer } from "@/components/mobile-navigation"
import { FloatingAiAssistant } from "@/components/floating-ai-assistant"
import { cn } from "@/lib/utils"

interface PremiumLayoutProps {
  children: ReactNode
  navbar?: ReactNode
  footer?: ReactNode
  sidebar?: ReactNode
  showMobileNav?: boolean
}

/**
 * Premium responsive layout with mobile bottom navigation
 */
export function PremiumLayout({
  children,
  navbar,
  footer,
  sidebar,
  showMobileNav = true,
}: PremiumLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      {navbar && <div className="sticky top-0 z-50">{navbar}</div>}

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        {sidebar && (
          <aside className="hidden lg:block w-64 border-r border-border/50 bg-card/50 backdrop-blur-sm sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto">
            {sidebar}
          </aside>
        )}

        {/* Main Area */}
        <main className="flex-1 w-full pb-20 md:pb-0">{children}</main>
      </div>

      {/* Footer */}
      {footer && <div className="border-t border-border/50">{footer}</div>}

      {/* Mobile Navigation */}
      {showMobileNav && <MobileNavigation />}

      {/* Spacer for mobile nav */}
      {showMobileNav && <MobileNavSpacer />}

      {/* Floating AI Assistant */}
      <FloatingAiAssistant />
    </div>
  )
}

/**
 * Page wrapper for consistent spacing
 */
interface PageWrapperProps {
  children: ReactNode
  className?: string
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
}

export function PageWrapper({
  children,
  className,
  maxWidth = "2xl",
}: PageWrapperProps) {
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
        "mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12",
        maxWidthMap[maxWidth],
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * Section with premium styling
 */
interface SectionProps {
  children: ReactNode
  className?: string
  title?: string
  description?: string
  gradient?: boolean
}

export function Section({
  children,
  className,
  title,
  description,
  gradient = false,
}: SectionProps) {
  return (
    <section
      className={cn(
        "relative py-12 md:py-24 overflow-hidden",
        gradient &&
          "bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent",
        className
      )}
    >
      <div className="relative">
        {(title || description) && (
          <div className="mb-12 md:mb-16">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  )
}
