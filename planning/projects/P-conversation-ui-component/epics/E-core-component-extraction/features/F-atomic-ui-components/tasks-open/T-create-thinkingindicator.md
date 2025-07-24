---
kind: task
id: T-create-thinkingindicator
title: Create ThinkingIndicator component with pulse animation
status: open
priority: normal
prerequisites: []
created: "2025-07-24T06:52:55.981165"
updated: "2025-07-24T06:52:55.981165"
schema_version: "1.1"
parent: F-atomic-ui-components
---

# Create ThinkingIndicator Component

## Context

Extract the ThinkingIndicator component from DesignPrototype.tsx (lines 332-339, 928) as a standalone atomic UI component. This component shows an animated pulsing dot to indicate agent thinking state.

## Location in DesignPrototype

- **Styling**: Lines 332-339 (`thinkingDot` style)
- **Usage**: Line 928 (rendered conditionally in AgentPill)

## Implementation Requirements

### 1. File Creation

Create `apps/desktop/src/components/ui/atomic/ThinkingIndicator.tsx` with:

```typescript
interface ThinkingIndicatorProps {
  /** Color of the thinking indicator */
  color?: string;
  /** Size of the indicator */
  size?: "small" | "medium" | "large";
  /** Animation speed */
  animationSpeed?: "slow" | "normal" | "fast";
  /** Custom CSS class */
  className?: string;
}

// Note: Create ThinkingIndicatorProps interface in packages/shared/src/types/ui/components/
// for future reusability across desktop and mobile platforms
```

### 2. Component Implementation

- Extract styling from DesignPrototype lines 332-339
- Implement CSS animations for pulse effect
- Use currentColor by default for color inheritance
- Support different sizes and animation speeds
- Pure rendering function with no internal state

### 3. Animation Requirements

- CSS keyframes for pulse animation
- Default: "pulse 2s infinite" matching DesignPrototype
- Opacity changes from 0.7 to full opacity
- Smooth animation timing function

### 4. Styling Requirements

- Width/height: 6px (medium), scale for other sizes
- Border radius: 50% for perfect circle
- Background: currentColor (inherits from parent)
- Opacity: 0.7 base opacity
- CSS animations with @keyframes pulse

### 5. Showcase Integration (CRITICAL)

**Immediately after creating the component:**

- Add ThinkingIndicator to ComponentShowcase page
- Demonstrate different sizes and colors
- Show various animation speeds
- Test with different parent color contexts
- Verify smooth animation performance

### Sample Data for Showcase:

```typescript
const indicatorSamples = [
  { color: "#3b82f6", size: "small" },
  { color: "#22c55e", size: "medium" },
  { color: "#a855f7", size: "large" },
  { color: "currentColor", size: "medium" }, // Inherits parent color
];
```

## Acceptance Criteria

- ✅ Component renders circular dot with pulse animation
- ✅ Size variants scale proportionally (small: 4px, medium: 6px, large: 8px)
- ✅ Animation speed variants work correctly
- ✅ Color prop or currentColor inheritance works
- ✅ CSS animations are smooth and performant
- ✅ Component under 50 lines of code
- ✅ TypeScript interfaces defined with JSDoc comments
- ✅ **Added to ComponentShowcase with visual verification**
- ✅ Both light and dark themes work correctly
- ✅ No console errors or TypeScript warnings
- ✅ Pixel-perfect match with DesignPrototype animation

## Dependencies

- F-foundation-typescript-interfaces (create ThinkingIndicatorProps in packages/shared/src/types/ui/components/)

## Testing Requirements

Include unit tests for:

- Basic rendering with default props
- Size variant styling application
- Color prop and currentColor inheritance
- Animation class application
- CSS animation presence

### Log
