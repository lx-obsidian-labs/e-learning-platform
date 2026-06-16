# Premium UI/UX Components Integration Guide

## Overview
This guide explains how to use the new premium UI/UX components and systems to enhance the e-learning platform's responsiveness and visual design.

## Table of Contents
1. [Responsive Design System](#responsive-design-system)
2. [Loading States](#loading-states)
3. [Empty States](#empty-states)
4. [Premium Components](#premium-components)
5. [Animations & Interactions](#animations--interactions)
6. [Best Practices](#best-practices)

## Responsive Design System

### Breakpoints
The platform uses semantic breakpoints for mobile-first responsive design:

```typescript
import { breakpoints, typography } from '@/config/responsive'

// Mobile: 320px
// Tablet: 768px (md)
// Desktop: 1024px (lg)
// Wide: 1280px (xl)
```

### Usage in Components
```tsx
// Using Tailwind breakpoints
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
  {/* 1 column on mobile, 2 on tablet, 3 on desktop */}
</div>
```

### Touch-Friendly Spacing
All interactive elements maintain 48px minimum touch targets:

```tsx
import { TOUCH_TARGET_MIN } from '@/config/responsive'

// Buttons automatically have 48px height
<button className="h-12 px-4"> {/* 48px = 3rem */}
  Click me
</button>
```

## Loading States

### Skeleton Loaders
Use skeleton loaders to show content is loading:

```tsx
import { CourseCardSkeleton, StatCardSkeleton } from '@/components/skeleton-loader'

// In a course list
{isLoading ? (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <CourseCardSkeleton key={i} />
    ))}
  </div>
) : (
  <CourseGrid courses={courses} />
)}
```

### Available Skeletons
- `Skeleton` - Generic skeleton with variants (text, rounded, circular)
- `CourseCardSkeleton` - Full course card placeholder
- `StatCardSkeleton` - Dashboard stat card placeholder
- `LessonSkeleton` - Lesson content placeholder
- `ProfileSkeleton` - User profile placeholder

## Empty States

### Usage
```tsx
import { EmptyNoEnrollments, EmptyState } from '@/components/empty-state'

// Pre-built empty states
{courses.length === 0 && <EmptyNoEnrollments />}

// Custom empty state
{items.length === 0 && (
  <EmptyState
    icon="BookOpen"
    title="No items"
    description="Get started by creating your first item."
    action={{
      label: "Create Item",
      onClick: () => navigate('/create'),
    }}
  />
)}
```

### Available Empty States
- `EmptyNoEnrollments` - No courses enrolled
- `EmptyNoResults` - Search returned no results
- `EmptyNoGroups` - No study groups
- `EmptyNoCertificates` - No certificates earned
- `EmptyNoActivity` - No activity yet
- `EmptySearchResults` - No search results

## Premium Components

### Premium Cards
```tsx
import { PremiumCard, PremiumCourseCard, PremiumStatCard } from '@/components/premium-card'

// Generic premium card
<PremiumCard variant="gradient" hover="lift">
  <div className="p-6">
    <h3>Card Title</h3>
    <p>Content goes here</p>
  </div>
</PremiumCard>

// Course card
<PremiumCourseCard
  title="Advanced React"
  description="Learn React patterns and best practices"
  thumbnail="/images/course.jpg"
  instructor={{ name: "John Doe", image: "/avatar.jpg" }}
  price={29.99}
  rating={4.8}
  enrollmentCount={1200}
  onClick={() => navigate('/courses/advanced-react')}
/>

// Stat card
<PremiumStatCard
  label="Total XP"
  value="2,450"
  icon={<TrendingUp className="h-5 w-5" />}
  trend={{ value: 15, direction: 'up' }}
  variant="primary"
/>
```

### Premium Buttons
```tsx
import { PremiumButton, IconButton } from '@/components/premium-button'

// Premium gradient button
<PremiumButton
  variant="gradient"
  size="lg"
  icon={<ArrowRight className="h-5 w-5" />}
  iconPosition="right"
>
  Get Started
</PremiumButton>

// Icon button
<IconButton icon={<Heart className="h-5 w-5" />} variant="premium" />
```

### Premium Inputs
```tsx
import { PremiumInput, FloatingLabelInput } from '@/components/premium-input'

// Regular input with icon
<PremiumInput
  label="Email"
  type="email"
  icon={<Mail className="h-5 w-5" />}
  placeholder="Enter your email"
  error={errors.email}
  hint="We'll never share your email"
/>

// Floating label input
<FloatingLabelInput
  label="Password"
  type="password"
  id="password"
  error={errors.password}
/>
```

### Premium Badges
```tsx
import { PremiumBadge, AchievementBadge } from '@/components/premium-badge'

// Color-coded badge
<PremiumBadge variant="success" size="lg">
  Completed
</PremiumBadge>

// Achievement badge
<AchievementBadge
  icon="🏆"
  label="First Course"
  unlocked={true}
/>
```

## Animations & Interactions

### Gesture Detection
```tsx
import { GestureDetector, PullToRefresh } from '@/components/gesture-detector'

// Swipe navigation
<GestureDetector
  onSwipeRight={() => navigate(-1)}
  onSwipeLeft={() => navigate(1)}
>
  <CourseCarousel />
</GestureDetector>

// Pull to refresh
<PullToRefresh onRefresh={async () => {
  await refetchCourses()
}}>
  <CourseList courses={courses} />
</PullToRefresh>
```

### Scroll Effects
```tsx
import {
  ScrollReveal,
  Parallax,
  FadeOnScroll,
} from '@/components/scroll-effects'

// Reveal on scroll
<ScrollReveal delay={200}>
  <Card>I appear when scrolled into view</Card>
</ScrollReveal>

// Parallax effect
<Parallax offset={0.5}>
  <HeroImage />
</Parallax>

// Fade on scroll
<FadeOnScroll>
  <ContentSection />
</FadeOnScroll>
```

### Page Transitions
```tsx
import {
  PageTransition,
  ModalTransition,
  ToastTransition,
} from '@/components/transitions'

// Page entrance
<PageTransition direction="right">
  <Page />
</PageTransition>

// Modal with backdrop
<ModalTransition isOpen={isOpen} onClose={handleClose}>
  <div className="p-6">
    <h2>Modal Content</h2>
  </div>
</ModalTransition>

// Toast notification
<ToastTransition isOpen={showToast} position="bottom">
  <div className="bg-green-600 text-white px-4 py-3 rounded-lg">
    Success!
  </div>
</ToastTransition>
```

### Advanced Animations
```tsx
import {
  CountUp,
  Typewriter,
  Confetti,
  ProgressBar,
} from '@/components/animations-advanced'

// Animated counter
<CountUp to={1000} duration={2000} prefix="R" suffix=" earned" />

// Typewriter effect
<Typewriter text="Welcome to Edu Learn" speed={50} cursor />

// Confetti celebration
{achievementUnlocked && <Confetti trigger={true} duration={3000} />}

// Smooth progress bar
<ProgressBar progress={75} showLabel animated />
```

## Best Practices

### 1. Mobile-First Development
- Always start with mobile styles (no breakpoint)
- Use `sm:`, `md:`, `lg:` prefixes for larger screens
- Test on real devices, not just browser dev tools

```tsx
// ✅ Good
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">

// ❌ Avoid
<div className="grid grid-cols-3 max-sm:grid-cols-1">
```

### 2. Touch Targets
- All interactive elements should be at least 48px (3rem)
- Buttons: `h-12 px-4` or larger
- Icon buttons: `h-10 w-10` or larger

```tsx
// ✅ Good
<button className="h-12 px-6">Click me</button>

// ❌ Avoid
<button className="h-8 px-3">Click me</button>
```

### 3. Loading & Empty States
- Always show skeleton loaders while fetching
- Provide meaningful empty state messages with actions
- Use appropriate loading indicators

```tsx
if (isLoading) return <CourseCardSkeleton />
if (courses.length === 0) return <EmptyNoEnrollments />
return <CourseGrid courses={courses} />
```

### 4. Performance
- Use `ScrollReveal` for lazy animations
- Implement `Parallax` sparingly on mobile
- Reduce motion for accessibility: `prefers-reduced-motion`

### 5. Accessibility
- Always include alt text for images
- Use semantic HTML
- Ensure color contrast meets WCAG AA standards
- Test with screen readers

```tsx
// ✅ Good
<img src="course.jpg" alt="Advanced React course" />
<button aria-label="Add to favorites">❤️</button>

// ❌ Avoid
<img src="course.jpg" />
<button>❤️</button>
```

### 6. Animations
- Always respect `prefers-reduced-motion` (built-in)
- Use animations for micro-interactions, not distractions
- Keep animations under 300ms for UI feedback

## Implementation Checklist

- [ ] Update layout with `PremiumLayout` component
- [ ] Replace existing cards with `PremiumCard` variants
- [ ] Add skeleton loaders to data-fetching pages
- [ ] Implement empty states for empty collections
- [ ] Update forms with `PremiumInput` components
- [ ] Add scroll animations to key sections
- [ ] Test mobile responsiveness on devices
- [ ] Verify accessibility with screen readers
- [ ] Add gesture support to course carousel
- [ ] Implement pull-to-refresh on mobile

## Support

For questions or issues:
1. Check the component's JSDoc comments
2. Review the Storybook documentation (if available)
3. Open an issue in the repository
