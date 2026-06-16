"use client"

import { ReactNode, useEffect, useState } from "react"
import { cn } from "@/lib/utils"

/**
 * Number counter animation
 */
interface CountUpProps {
  from?: number
  to: number
  duration?: number
  suffix?: string
  prefix?: string
}

export function CountUp({
  from = 0,
  to,
  duration = 2000,
  suffix = "",
  prefix = "",
}: CountUpProps) {
  const [count, setCount] = useState(from)

  useEffect(() => {
    let startTime: number | null = null
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = (timestamp - startTime) / duration

      if (progress < 1) {
        const currentCount = Math.floor(from + (to - from) * progress)
        setCount(currentCount)
        requestAnimationFrame(animate)
      } else {
        setCount(to)
      }
    }

    requestAnimationFrame(animate)
  }, [from, to, duration])

  return (
    <span>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}

/**
 * Typewriter effect
 */
interface TypewriterProps {
  text: string
  speed?: number
  cursor?: boolean
}

export function Typewriter({
  text,
  speed = 50,
  cursor = true,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, speed)

      return () => clearTimeout(timer)
    }
  }, [currentIndex, text, speed])

  return (
    <span>
      {displayText}
      {cursor && currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  )
}

/**
 * Confetti explosion effect
 */
interface ConfettiProps {
  trigger?: boolean
  duration?: number
}

export function Confetti({
  trigger = true,
  duration = 3000,
}: ConfettiProps) {
  const [particles, setParticles] = useState<
    Array<{
      id: number
      left: number
      delay: number
      duration: number
      size: number
    }>
  >([])

  useEffect(() => {
    if (!trigger) return

    const newParticles = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.2,
      duration: 2 + Math.random() * 0.5,
      size: 4 + Math.random() * 6,
    }))

    setParticles(newParticles)

    const timer = setTimeout(() => {
      setParticles([])
    }, duration)

    return () => clearTimeout(timer)
  }, [trigger, duration])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={cn(
            "fixed w-2 h-2 rounded-full pointer-events-none",
            "animate-bounce"
          )}
          style={{
            left: `${particle.left}%`,
            top: "-10px",
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: [
              "#fbbf24",
              "#f87171",
              "#60a5fa",
              "#34d399",
              "#a78bfa",
            ][Math.floor(Math.random() * 5)],
            animation: `fall ${particle.duration}s linear ${particle.delay}s forwards`,
          }}
        />
      ))}

      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotateZ(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

/**
 * Progress bar with smooth animation
 */
interface ProgressBarProps {
  progress: number
  animated?: boolean
  showLabel?: boolean
  color?: "primary" | "success" | "warning" | "danger"
}

export function ProgressBar({
  progress,
  animated = true,
  showLabel = false,
  color = "primary",
}: ProgressBarProps) {
  const colorMap = {
    primary: "bg-indigo-600",
    success: "bg-emerald-600",
    warning: "bg-amber-600",
    danger: "bg-red-600",
  }

  return (
    <div className="w-full space-y-2">
      <div className="relative h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-500",
            colorMap[color],
            animated && "animate-pulse"
          )}
          style={{
            width: `${Math.min(Math.max(progress, 0), 100)}%`,
          }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-muted-foreground text-right">
          {Math.round(progress)}%
        </p>
      )}
    </div>
  )
}
