/**
 * Responsive Design System Configuration
 * Mobile-first approach with semantic breakpoints
 */

export const breakpoints = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const

export const mediaQueries = {
  xs: `(min-width: ${breakpoints.xs}px)`,
  sm: `(min-width: ${breakpoints.sm}px)`,
  md: `(min-width: ${breakpoints.md}px)`,
  lg: `(min-width: ${breakpoints.lg}px)`,
  xl: `(min-width: ${breakpoints.xl}px)`,
  "2xl": `(min-width: ${breakpoints["2xl"]}px)`,
  // Mobile-only queries
  "max-sm": `(max-width: ${breakpoints.sm - 1}px)`,
  "max-md": `(max-width: ${breakpoints.md - 1}px)`,
  "max-lg": `(max-width: ${breakpoints.lg - 1}px)`,
} as const

/**
 * Touch-friendly spacing (based on 4px unit system)
 */
export const spacing = {
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "0.75rem", // 12px
  base: "1rem", // 16px
  lg: "1.25rem", // 20px
  xl: "1.5rem", // 24px
  "2xl": "2rem", // 32px
  "3xl": "2.5rem", // 40px
  "4xl": "3rem", // 48px
  "5xl": "3.5rem", // 56px
  "6xl": "4rem", // 64px
} as const

/**
 * Touch target minimum size: 48px (recommended by WCAG)
 */
export const TOUCH_TARGET_MIN = 48

/**
 * Responsive grid configuration
 */
export const gridConfig = {
  mobile: {
    cols: 1,
    gap: spacing.base,
  },
  tablet: {
    cols: 2,
    gap: spacing.lg,
  },
  desktop: {
    cols: 3,
    gap: spacing.xl,
  },
} as const

/**
 * Responsive font scaling
 */
export const typography = {
  h1: {
    mobile: { size: "1.875rem", lineHeight: "2.25rem" }, // 30px
    tablet: { size: "2.25rem", lineHeight: "2.5rem" }, // 36px
    desktop: { size: "3.5rem", lineHeight: "3.75rem" }, // 56px
  },
  h2: {
    mobile: { size: "1.5rem", lineHeight: "2rem" }, // 24px
    tablet: { size: "1.875rem", lineHeight: "2.25rem" }, // 30px
    desktop: { size: "2.25rem", lineHeight: "2.5rem" }, // 36px
  },
  h3: {
    mobile: { size: "1.25rem", lineHeight: "1.5rem" }, // 20px
    tablet: { size: "1.5rem", lineHeight: "2rem" }, // 24px
    desktop: { size: "1.875rem", lineHeight: "2.25rem" }, // 30px
  },
  body: {
    mobile: { size: "0.9375rem", lineHeight: "1.5rem" }, // 15px
    tablet: { size: "1rem", lineHeight: "1.6rem" }, // 16px
    desktop: { size: "1rem", lineHeight: "1.6rem" }, // 16px
  },
  caption: {
    mobile: { size: "0.8125rem", lineHeight: "1.25rem" }, // 13px
    tablet: { size: "0.875rem", lineHeight: "1.25rem" }, // 14px
    desktop: { size: "0.875rem", lineHeight: "1.25rem" }, // 14px
  },
} as const
