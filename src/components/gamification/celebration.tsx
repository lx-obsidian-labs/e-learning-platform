"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"

interface CelebrationProps {
  show: boolean
  onComplete: () => void
  message?: string
}

interface Particle {
  id: number
  left: string
  color: string
  delay: string
  size: number
}

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444"]

export function Celebration({ show, onComplete, message = "Congratulations!" }: CelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (show) {
      const generated: Particle[] = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: `${Math.random() * 2}s`,
        size: Math.floor(Math.random() * 8) + 6,
      }))
      setParticles(generated)

      const timer = setTimeout(() => {
        onComplete()
      }, 3000)

      return () => clearTimeout(timer)
    } else {
      setParticles([])
    }
  }, [show, onComplete])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in" />
      {particles.map((p) => (
        <div
          key={p.id}
          className="celebration-particle"
          style={{
            left: p.left,
            top: "-10px",
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
          }}
        />
      ))}
      <div className="relative pointer-events-auto animate-scale-in bg-card border shadow-2xl rounded-2xl p-8 max-w-sm w-full mx-4 text-center space-y-4">
        <div className="text-5xl">🎉</div>
        <h2 className="text-2xl font-bold">{message}</h2>
        <p className="text-muted-foreground text-sm">Keep up the great work!</p>
        <Button onClick={onComplete} className="btn-premium w-full">
          Awesome!
        </Button>
      </div>
    </div>
  )
}
