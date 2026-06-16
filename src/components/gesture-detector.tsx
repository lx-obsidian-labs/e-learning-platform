"use client"

import { ReactNode, useRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface GestureDetectorProps {
  children: ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onLongPress?: () => void
  threshold?: number
  longPressDuration?: number
}

export function GestureDetector({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onLongPress,
  threshold = 50,
  longPressDuration = 500,
}: GestureDetectorProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(
    null
  )
  const longPressTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      }

      // Set long press timeout
      longPressTimeoutRef.current = setTimeout(() => {
        onLongPress?.()
      }, longPressDuration)
    }

    const handleTouchMove = () => {
      // Cancel long press on move
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current)
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      // Clear long press timeout
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current)
      }

      // Check if it's a swipe (not just a tap)
      if (distance > threshold) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          if (deltaX > 0) {
            onSwipeRight?.()
          } else {
            onSwipeLeft?.()
          }
        } else {
          // Vertical swipe
          if (deltaY > 0) {
            onSwipeDown?.()
          } else {
            onSwipeUp?.()
          }
        }
      }

      touchStartRef.current = null
    }

    element.addEventListener("touchstart", handleTouchStart)
    element.addEventListener("touchmove", handleTouchMove)
    element.addEventListener("touchend", handleTouchEnd)

    return () => {
      element.removeEventListener("touchstart", handleTouchStart)
      element.removeEventListener("touchmove", handleTouchMove)
      element.removeEventListener("touchend", handleTouchEnd)
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onLongPress, threshold, longPressDuration])

  return <div ref={elementRef}>{children}</div>
}

/**
 * Pull-to-refresh component
 */
interface PullToRefreshProps {
  children: ReactNode
  onRefresh: () => Promise<void>
  threshold?: number
}

export function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const touchStartRef = useRef<number>(0)
  const scrollableRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = scrollableRef.current
    if (!element) return

    const handleTouchStart = (e: TouchEvent) => {
      touchStartRef.current = e.touches[0].clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (element.scrollTop > 0 || isRefreshing) return

      const touchY = e.touches[0].clientY
      const distance = Math.max(0, touchY - touchStartRef.current)
      setPullDistance(Math.min(distance, threshold * 1.5))
    }

    const handleTouchEnd = async () => {
      if (pullDistance > threshold && !isRefreshing) {
        setIsRefreshing(true)
        try {
          await onRefresh()
        } finally {
          setIsRefreshing(false)
        }
      }
      setPullDistance(0)
    }

    element.addEventListener("touchstart", handleTouchStart)
    element.addEventListener("touchmove", handleTouchMove, { passive: true })
    element.addEventListener("touchend", handleTouchEnd)

    return () => {
      element.removeEventListener("touchstart", handleTouchStart)
      element.removeEventListener("touchmove", handleTouchMove)
      element.removeEventListener("touchend", handleTouchEnd)
    }
  }, [pullDistance, threshold, isRefreshing, onRefresh])

  return (
    <div
      ref={scrollableRef}
      className="relative overflow-y-auto"
      style={{
        transform: `translateY(${pullDistance}px)`,
        transition: isRefreshing ? "none" : "transform 0.3s ease-out",
      }}
    >
      {/* Refresh indicator */}
      <div
        className={cn(
          "absolute -top-16 inset-x-0 flex items-center justify-center",
          "transition-opacity duration-300"
        )}
        style={{
          opacity: Math.min(pullDistance / threshold, 1),
        }}
      >
        <div
          className={cn(
            "inline-flex items-center justify-center h-10 w-10 rounded-full",
            "bg-primary/20 text-primary",
            isRefreshing && "animate-spin"
          )}
          style={{
            transform: `rotate(${Math.min((pullDistance / threshold) * 360, 360)}deg)`,
          }}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="pt-4">{children}</div>
    </div>
  )
}
