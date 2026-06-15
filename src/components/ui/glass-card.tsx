import * as React from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.ComponentProps<"div"> {
  glow?: boolean
}

export function GlassCard({ className, glow = false, children, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-card rounded-xl p-6 transition-all duration-300",
        glow && "card-glow",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
