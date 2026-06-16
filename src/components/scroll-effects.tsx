"use client"

import { ReactNode, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  threshold?: number
}

/**
 * Reveals element with animation when it enters viewport
 */
export function ScrollReveal({
  children,
  className,
  delay = 0,
  threshold = 0.1,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
          observer.unobserve(entry.target)
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [delay, threshold])

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8",
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * Parallax scroll effect
 */
interface ParallaxProps {
  children: ReactNode
  offset?: number
  className?: string
}

export function Parallax({
  children,
  offset = 0.5,
  className,
}: ParallaxProps) {
  const [scrollY, setScrollY] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const elementPosition = ref.current.getBoundingClientRect().top
        const windowHeight = window.innerHeight

        if (elementPosition < windowHeight) {
          setScrollY((windowHeight - elementPosition) * offset)
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [offset])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: `translateY(${scrollY}px)`,
        transition: "transform 0.1s ease-out",
      }}
    >
      {children}
    </div>
  )
}

/**
 * Fade on scroll effect
 */
interface FadeOnScrollProps {
  children: ReactNode
  className?: string
}

export function FadeOnScroll({
  children,
  className,
}: FadeOnScrollProps) {
  const [opacity, setOpacity] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const elementPosition = ref.current.getBoundingClientRect().top
        const windowHeight = window.innerHeight
        const progress = Math.max(0, Math.min(1, 1 - elementPosition / windowHeight))
        setOpacity(progress)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity,
        transition: "opacity 0.3s ease-out",
      }}
    >
      {children}
    </div>
  )
}
