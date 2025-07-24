---
kind: task
id: T-extract-button-variants-with
parent: F-atomic-ui-components
status: done
title: Extract Button variants with showcase integration
priority: high
prerequisites: []
created: "2025-07-24T07:25:36.346994"
updated: "2025-07-24T08:24:32.598416"
schema_version: "1.1"
worktree: null
---

# Extract Button Variants Component

## Context

Extract multiple button variants from `apps/desktop/src/pages/DesignPrototype.tsx` into a unified Button component with different variants. This includes Send Button, Context Menu Item, Mode Toggle, and Sidebar Toggle buttons.

## Implementation Requirements

### Component Creation

- Create `packages/shared/src/types/ui/components/ButtonProps.ts`
- Add export to `packages/shared/src/types/ui/components/index.ts`
- Create `apps/desktop/src/components/ui/atomic/Button.tsx`
- Extract styling from DesignPrototype for different button types
- Create unified component with variant prop system
- Support different button purposes: primary, secondary, ghost, toggle
- Import `ButtonProps` from `@fishbowl-ai/shared/types/ui/components`

### Props Interface Structure

```typescript
interface ButtonProps {
  variant: "primary" | "secondary" | "ghost" | "toggle";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}
```

### Button Variants to Extract

1. **Primary** (Send Button) - solid background, prominent styling
2. **Secondary** - outlined or subtle background
3. **Ghost** (Context Menu Item) - transparent background, hover effects
4. **Toggle** (Mode/Sidebar Toggle) - state-aware styling

### Styling Requirements

- Theme-aware colors using CSS custom properties
- Consistent padding and border radius across variants
- Focus states and keyboard navigation support
- Hover animations and transitions
- Loading state with spinner (optional)
- Icon support with proper spacing

### ComponentShowcase Integration (CRITICAL)

- **Immediately add to ComponentShowcase** as soon as component is created
- Show all variants (primary, secondary, ghost, toggle)
- Demonstrate all sizes (small, medium, large)
- Show disabled and loading states
- Include icon examples (with and without text)
- Test hover and focus states
- Verify theme switching works for all variants
- Create realistic button examples (Save, Cancel, Delete, etc.)

## Acceptance Criteria

- ✅ Component renders in separate file under `apps/desktop/src/components/ui/atomic/`
- ✅ Unified component supporting all button variants
- ✅ Props-based rendering with proper TypeScript interfaces
- ✅ All variants and states displayed in ComponentShowcase
- ✅ Theme-aware styling using CSS custom properties
- ✅ Accessibility features (focus, keyboard navigation)
- ✅ TypeScript strict mode compliance
- ✅ Component under 150 lines
- ✅ Export added to `apps/desktop/src/components/ui/atomic/index.ts`

## File Locations

- **Source extraction**: `apps/desktop/src/pages/DesignPrototype.tsx` (various button styles)
- **Component file**: `apps/desktop/src/components/ui/atomic/Button.tsx`
- **Showcase integration**: `apps/desktop/src/pages/showcase/ComponentShowcase.tsx`
- **Theme reference**: `packages/ui-theme/src/claymorphism-theme.css`

### Log

**2025-07-24T13:51:42.567820Z** - Completed Button component implementation with comprehensive ComponentShowcase integration. Created unified Button component supporting 4 variants (primary, secondary, ghost, toggle) with all required props, sizes, and states. Added comprehensive showcase demonstrating all variants, sizes, disabled/loading states, icon support, and real-world examples. All quality checks passing and component fully integrated into the atomic components system.

- filesChanged: ["packages/shared/src/types/ui/components/ButtonProps.ts", "packages/shared/src/types/ui/components/index.ts", "apps/desktop/src/components/ui/atomic/Button.tsx", "apps/desktop/src/components/ui/atomic/index.ts", "apps/desktop/src/pages/showcase/ComponentShowcase.tsx"]
