---
kind: task
id: T-extract-thinkingindicator
title: Extract ThinkingIndicator component with showcase integration
status: open
priority: normal
prerequisites: []
created: "2025-07-24T07:25:21.180752"
updated: "2025-07-24T07:25:21.180752"
schema_version: "1.1"
parent: F-atomic-ui-components
---

# Extract ThinkingIndicator Component

## Context

Extract the ThinkingIndicator component from `apps/desktop/src/pages/DesignPrototype.tsx` into a reusable atomic component. This component shows an animated pulsing dot to indicate agent thinking state.

## Implementation Requirements

### Component Creation

- Create `packages/shared/src/types/ui/components/ThinkingIndicatorProps.ts`
- Add export to `packages/shared/src/types/ui/components/index.ts`
- Create `apps/desktop/src/components/ui/atomic/ThinkingIndicator.tsx`
- Extract styling from DesignPrototype (thinkingDot style object around line 332+)
- Create CSS animations for pulsing effect using theme-aware colors
- Import `ThinkingIndicatorProps` from `@fishbowl-ai/shared/types/ui/components`

### Props Interface Structure

```typescript
interface ThinkingIndicatorProps {
  color?: string;
  size?: "small" | "medium" | "large"; // 4px, 6px, 8px
  animationSpeed?: "slow" | "normal" | "fast";
  className?: string;
}
```

### Styling Requirements

- Circular dot (6px x 6px default, scalable by size)
- Border radius 50% for perfect circle
- Pulsing animation using CSS keyframes
- Theme-aware default color using `var(--primary)`
- Smooth opacity transitions (0.3 to 1.0)
- Animation duration: slow (2s), normal (1.5s), fast (1s)

### ComponentShowcase Integration (CRITICAL)

- **Immediately add to ComponentShowcase** as soon as component is created
- Show all size variants (small, medium, large)
- Demonstrate different colors (default, red, blue, green)
- Show all animation speeds (slow, normal, fast)
- Test in both light and dark themes
- Verify smooth pulsing animation
- Show multiple indicators together to test performance

## Acceptance Criteria

- ✅ Component renders in separate file under `apps/desktop/src/components/ui/atomic/`
- ✅ Props-based rendering with no internal state
- ✅ Smooth CSS-based pulsing animation
- ✅ All variants displayed in ComponentShowcase
- ✅ Theme-aware color handling
- ✅ TypeScript strict mode compliance
- ✅ Component under 50 lines (simple animation component)
- ✅ Export added to `apps/desktop/src/components/ui/atomic/index.ts`

## File Locations

- **Source extraction**: `apps/desktop/src/pages/DesignPrototype.tsx` (thinkingDot styles)
- **Component file**: `apps/desktop/src/components/ui/atomic/ThinkingIndicator.tsx`
- **Showcase integration**: `apps/desktop/src/pages/showcase/ComponentShowcase.tsx`
- **Theme reference**: `packages/ui-theme/src/claymorphism-theme.css`

### Log
