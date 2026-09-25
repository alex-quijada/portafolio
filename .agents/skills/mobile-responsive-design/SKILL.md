---
name: mobile-responsive-design
description: >-
  Best practices, viewport management, and touch UX standards for building
  mobile-first and responsive interfaces with Tailwind CSS v4 and React.
---

# Mobile Responsive Design & Touch UX Skill

This skill provides guidelines and patterns for implementing responsive, touch-friendly interfaces in web applications, specifically tailored for mobile viewports and OS-style interfaces.

---

## 1. Viewport & Layout Management

- **Dynamic Viewport Height (`dvh`)**: Use `dvh` (or `100dvh`) instead of `100vh` or fixed `100%` on mobile root containers to prevent layout breaking when virtual keyboards or browser address bars appear/hide.
- **Safe Area Insets**: Respect mobile display cutouts and home gesture indicators using CSS environment variables:
  ```css
  padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
  padding-top: max(0.5rem, env(safe-area-inset-top));
  ```
- **Overflow & Scrolling**: Prevent root horizontal bouncing with `overflow-x: hidden`. Ensure nested scrollable panes utilize smooth touch momentum:
  ```css
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
  ```

---

## 2. Touch Target & Accessibility Standards

- **Minimum Tap Target**: Interactive elements (buttons, icons, menu items) MUST have a clickable area of at least **44×44px** on touch screens to comply with WCAG 2.2 touch target size guidelines.
- **Spacing**: Maintain at least **8px** separation between adjacent touch targets.
- **Visual Feedback**: Use `:active` states (such as subtle scale or background brightness adjustments) to provide immediate tactile feedback on touch.

---

## 3. Tailwind CSS v4 Responsive Patterns

- **Mobile-First Breakpoint Structure**:
  - Default: Mobile (`< 640px`)
  - `sm:` Small tablets / landscape phones (`>= 640px`)
  - `md:` Tablets / smaller laptops (`>= 768px`)
  - `lg:` Desktops (`>= 1024px`)
- **Typography Scaling**:
  - Minimum readable body text on mobile: `13px` – `14px` (`text-xs` / `text-sm`).
  - Avoid text sizes smaller than `11px` for critical information on mobile viewports.

---

## 4. OS-Style Window Management on Mobile

- **Mobile Viewport Behavior (`< 640px`)**:
  - Open windows in **full-screen or bottom-sheet modal mode** covering available viewport area.
  - Disable mouse drag/resize listeners on touch screens to prevent interference with natural vertical scrolling.
  - Provide prominent, accessible Close (`✕`) and Minimize/Back buttons in window titlebars.
- **Virtual Keyboard Handling**:
  - In form views and chat applications, ensure the active input field remains visible above the virtual keyboard without clipping.
