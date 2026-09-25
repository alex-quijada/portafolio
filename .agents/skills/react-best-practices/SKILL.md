---
name: react-best-practices
description: >-
  Idiomatic React 19 patterns, TypeScript typing, component lifecycle,
  state management, and performance optimization guidelines.
---

# React 19 & TypeScript Best Practices Skill

This skill provides coding guidelines, state architecture, and performance patterns for React 19 + TypeScript + Vite codebases.

---

## 1. Component Architecture & State Design

- **State Colocation**: Keep state as close to where it is used as possible. Lift state up only when siblings or parents require shared synchronization.
- **Derived State vs. Sync State**: Prefer computing values on the fly during render rather than storing redundant state and updating it with `useEffect`.
- **Custom Hooks**: Extract reusable UI logic, event listeners, and data fetching into dedicated custom hooks (`use*`).
- **Clean Event Cleanup**: Ensure event listeners (resize, scroll, pointer events) and timers (`setTimeout`, `setInterval`) have robust cleanup returns in `useEffect`.

---

## 2. React 19 & TypeScript Guidelines

- **Strict Typing**: Avoid `any`. Type all props, event handlers, and callbacks explicitly.
- **Default Exports**: Follow the project convention of exporting components as default exports.
- **Uncontrolled vs. Controlled Inputs**: Maintain clear controlled form inputs with explicit `value` and `onChange` handlers.
- **JSX Safety**:
  - Use double quotes or escaped characters for strings with apostrophes to prevent build errors.
  - Ensure all tags are properly closed with balanced braces.

---

## 3. Performance & Rendering Optimization

- **Stable Callbacks**: Use `useCallback` for callbacks passed to memoized children or window manager operations.
- **Pointer & Touch Events**: Use standard Pointer Events (`onPointerDown`, `onPointerMove`, `onPointerUp`) rather than mixing mouse and touch handlers when supporting multi-device interactions.
- **DOM Measurement**: When measuring viewport dimensions (`window.innerWidth`, `window.innerHeight`), debounce or use passive resize listeners.
