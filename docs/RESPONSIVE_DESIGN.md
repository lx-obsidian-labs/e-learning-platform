# Responsive Design Implementation Guide

## Overview
This guide provides detailed instructions for implementing responsive design across the e-learning platform.

## Mobile-First Approach

The platform uses a mobile-first approach with the following breakpoints:

| Breakpoint | Size | Device |
|------------|------|--------|
| Default   | 320px | Mobile |
| sm | 640px | Small tablet |
| md | 768px | Tablet |
| lg | 1024px | Small desktop |
| xl | 1280px | Desktop |
| 2xl | 1536px | Large desktop |

## Key Responsive Patterns

### 1. Grid Layouts

**Mobile (1 column):**
```tsx
<div className="grid grid-cols-1 gap-4">
  {/* Single column on mobile */}
</div>
```

**Tablet (2 columns):**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
  {/* 1 column on mobile, 2 on tablet */}
</div>
```

**Desktop (3+ columns):**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
  {/* Responsive columns */}
</div>
```

### 2. Navigation

**Mobile:** Bottom tab navigation (fixed)
```tsx
<MobileNavigation /> // Auto-hides on md and above
```

**Desktop:** Horizontal navbar + sidebar
```tsx
<Navbar /> {/* Always visible */}
<Sidebar className="hidden lg:block" /> {/* Hidden on mobile */}
```

### 3. Typography

**Fluid font scaling:**
```tsx
// Automatically scales based on device
<h1 className="text-3xl sm:text-4xl md:text-5xl">Heading</h1>
<p className="text-sm sm:text-base md:text-lg">Body text</p>
```

### 4. Spacing

**Responsive padding:**
```tsx
<div className="px-4 sm:px-6 md:px-8 py-6 md:py-12">
  {/* Padding scales with device size */}
</div>
```

## Common Responsive Components

### Dashboard

**Mobile:** Single column stats
```tsx
<div className="grid grid-cols-1 gap-4">
  <StatCard />
  <StatCard />
  <StatCard />
</div>
```

**Tablet:** Two column stats
```tsx
<div className="grid grid-cols-2 gap-6">
  <StatCard />
  <StatCard />
  <StatCard />
  <StatCard />
</div>
```

**Desktop:** Four column stats
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
  <StatCard />
  <StatCard />
  <StatCard />
  <StatCard />
</div>
```

### Course Grid

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
  {courses.map(course => (
    <PremiumCourseCard key={course.id} {...course} />
  ))}
</div>
```

### Form Layout

```tsx
<form className="space-y-6 max-w-2xl">
  {/* Single column form */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <PremiumInput label="First Name" />
    <PremiumInput label="Last Name" />
  </div>
  <PremiumInput label="Email" fullWidth />
  <PremiumButton fullWidth>Submit</PremiumButton>
</form>
```

## Touch Target Sizing

All interactive elements must be at least **48px** (3rem) in height:

```tsx
// Button sizes
small: "h-9"     // 36px - Avoid on mobile
default: "h-10"  // 40px - Minimum for mobile
medium: "h-12"   // 48px - Recommended
large: "h-14"    // 56px - Premium

// Icon buttons
<button className="h-12 w-12"> {/* 48x48px */}
  <Icon />
</button>
```

## Safe Zones (Notch Support)

For devices with notches or home indicators:

```tsx
<div className="safe-area-inset">
  {/* Content is safe from notches */}
</div>

// In CSS
.safe-area-inset {
  padding: max(1rem, env(safe-area-inset-top))
         max(1rem, env(safe-area-inset-right))
         max(1rem, env(safe-area-inset-bottom))
         max(1rem, env(safe-area-inset-left));
}
```

## Image Optimization

### Responsive Images

```tsx
<img
  src="course-sm.jpg"
  srcSet="course-sm.jpg 640w, course-md.jpg 1024w, course-lg.jpg 1280w"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  alt="Course thumbnail"
  className="w-full h-auto"
/>
```

### Picture Element

```tsx
<picture>
  <source media="(min-width: 1024px)" srcSet="desktop.jpg" />
  <source media="(min-width: 640px)" srcSet="tablet.jpg" />
  <img src="mobile.jpg" alt="Course" />
</picture>
```

## Testing Responsive Design

### Device Testing Checklist

- [ ] iPhone 12 Mini (375px)
- [ ] iPhone 12 Pro (390px)
- [ ] iPhone 12 Pro Max (428px)
- [ ] iPad (768px)
- [ ] iPad Pro (1024px)
- [ ] Desktop (1280px+)

### Browser Dev Tools

1. Open DevTools (F12)
2. Click device toolbar icon
3. Test common devices
4. Use "Responsive" mode for custom sizes
5. Test portrait and landscape

### Performance on Mobile

```bash
# Test performance
npm run build
npm start

# Use Chrome DevTools Lighthouse
# Run audit for mobile performance
```

## Accessibility Considerations

### Touch Targets
- Minimum 48x48px
- 8px padding between targets
- No tiny text (< 12px)

### Viewport Meta Tag
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

### Orientation Lock (if needed)
```html
<meta name="apple-mobile-web-app-status-bar-style" content="default">
```

## Common Pitfalls

❌ **Don't:**
- Use fixed widths (use percentages/flex/grid)
- Assume desktop scrollbar width
- Forget to test on actual devices
- Ignore safe areas on notched devices
- Use very small touch targets

✅ **Do:**
- Use relative units (%, em, rem)
- Test on multiple devices
- Implement viewport meta tags correctly
- Use CSS media queries from Tailwind
- Maintain 48px touch targets

## Resources

- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Mobile-First Approach](https://www.w3schools.com/css/css_rwd_intro.asp)
- [Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Web Docs - Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
