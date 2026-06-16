"use client"

import { ReactNode, useState } from "react"
import { cn } from "@/lib/utils"

interface PageTransitionProps {
  children: ReactNode
  direction?: "left" | "right" | "up" | "down"
}

/**
 * Smooth page transition effect
 */
export function PageTransition({
  children,
  direction = "right",
}: PageTransitionProps) {
  const directionMap = {
    left: "translate-x-full",
    right: "-translate-x-full",
    up: "translate-y-full",
    down: "-translate-y-full",
  }

  return (
    <div
      className={cn(
        "transition-all duration-500 ease-out",
        "animate-in",
        directionMap[direction]
      )}
    >
      {children}
    </div>
  )
}

/**
 * Modal transition with backdrop
 */
interface ModalTransitionProps {
  isOpen: boolean
  children: ReactNode
  onClose: () => void
}

export function ModalTransition({
  isOpen,
  children,
  onClose,
}: ModalTransitionProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm",
          "transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-end sm:items-center justify-center",
          "transition-all duration-300",
          "pointer-events-none",
          isOpen && "pointer-events-auto"
        )}
      >
        <div
          className={cn(
            "w-full sm:w-auto bg-background rounded-t-2xl sm:rounded-2xl",
            "transition-all duration-300 transform",
            isOpen
              ? "translate-y-0 opacity-100"
              : "translate-y-full sm:scale-95 opacity-0"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </>
  )
}

/**
 * Toast notification transition
 */
interface ToastTransitionProps {
  isOpen: boolean
  children: ReactNode
  position?: "top" | "bottom"
}

export function ToastTransition({
  isOpen,
  children,
  position = "bottom",
}: ToastTransitionProps) {
  return (
    <div
      className={cn(
        "fixed z-50",
        position === "top" ? "top-4" : "bottom-4",
        "left-4 right-4 sm:left-auto sm:right-4 sm:w-auto",
        "transition-all duration-300 transform",
        isOpen
          ? "translate-y-0 opacity-100"
          : position === "top"
            ? "-translate-y-full opacity-0"
            : "translate-y-full opacity-0"
      )}
    >
      {children}
    </div>
  )
}

/**
 * Dropdown menu transition
 */
interface DropdownTransitionProps {
  isOpen: boolean
  children: ReactNode
}

export function DropdownTransition({
  isOpen,
  children,
}: DropdownTransitionProps) {
  return (
    <div
      className={cn(
        "absolute top-full mt-2 z-40",
        "transition-all duration-200 origin-top",
        isOpen
          ? "opacity-100 scale-100 pointer-events-auto"
          : "opacity-0 scale-95 pointer-events-none"
      )}
    >
      {children}
    </div>
  )
}
