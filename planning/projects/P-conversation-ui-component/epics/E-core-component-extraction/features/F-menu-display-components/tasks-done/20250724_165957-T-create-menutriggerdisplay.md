---
kind: task
id: T-create-menutriggerdisplay
parent: F-menu-display-components
status: done
title: Create MenuTriggerDisplay component for ellipsis button
priority: high
prerequisites: []
created: "2025-07-24T16:17:37.756640"
updated: "2025-07-24T16:54:19.462027"
schema_version: "1.1"
worktree: null
---

# Create MenuTriggerDisplay Component

## Overview

Extract and implement the MenuTriggerDisplay component from DesignPrototype.tsx, representing the ellipsis button trigger for context menus.

## Implementation Details

### Source Reference

- **Primary Source**: `apps/desktop/src/pages/DesignPrototype.tsx` (lines 504-525)
- **Styling Objects**: `ellipsisButton`, `ellipsisButtonHover` styles
- **Visual Element**: Three-dot ellipsis button (⋯) used to trigger context menus

### Component Structure

```typescript
// apps/desktop/src/components/menu/MenuTriggerDisplay.tsx
interface MenuTriggerDisplayProps {
  active?: boolean;
  position?: "relative" | "absolute";
  size?: "small" | "medium";
  disabled?: boolean;
  variant?: "normal" | "hover" | "active";
  className?: string;
}
```

(Implement `position`, `size`, and `variant` as named types in TypeScript. See `packages/shared/src/types/ui/core/MessageType.ts` as an example.)

### Visual States to Support

- **normal**: Default ellipsis button appearance (0.6 opacity)
- **hover**: Visual hover state with background color and full opacity
- **active**: Button state when menu is open
- **disabled**: Reduced opacity and disabled cursor

### Styling Requirements

- Extract styling from DesignPrototype's `ellipsisButton` object:
  - `position: relative`
  - `background: none`
  - `border: none`
  - `color: var(--muted-foreground)`
  - `cursor: pointer` (visual only)
  - `padding: 4px 6px`
  - `borderRadius: 4px`
  - `fontSize: 14px`
  - `marginLeft: 8px`
  - `opacity: 0.6`
  - `transition: all 0.15s`
  - `minWidth: 20px`
  - `minHeight: 20px`
  - `display: flex`
  - `alignItems: center`
  - `justifyContent: center`

### Hover State Styling

- From `ellipsisButtonHover`:
  - `opacity: 1`
  - `backgroundColor: var(--muted)`

### File Structure

Create component at: `apps/desktop/src/components/menu/MenuTriggerDisplay.tsx`

### TypeScript Integration

- Props interface for visual configuration
- No interactive handlers (onClick, etc.)
- Support for different trigger variants

## Acceptance Criteria

✅ **Component Implementation**

- Component file created in correct location
- Props interface for visual state configuration
- No click handlers or interactive functionality
- Renders ellipsis character (⋯) or three dots

✅ **Visual State Display**

- Normal, hover, active, and disabled states displayed correctly
- Proper opacity transitions between states
- Background color changes for hover/active states
- Sizing and positioning options working

✅ **Visual Fidelity**

- Exact match with DesignPrototype ellipsis button appearance
- Proper padding, border radius, and spacing
- Color scheme using theme variables
- Transition effects preserved (visual representation)

✅ **Positioning Options**

- Support for relative and absolute positioning
- Proper sizing for small/medium variants
- Margin and padding preserved from design
- Flexbox centering for ellipsis character

✅ **Code Quality**

- Component under 60 lines
- TypeScript strict mode compliance
- No added interactive functionality
- Clean variant-based visual state control

✅ **Showcase Integration** (CRITICAL - Done immediately)

- Add component to ComponentShowcase as soon as it's created
- Show all visual states (normal, hover, active, disabled)
- Display different sizes and positioning
- Demonstrate typical menu trigger appearance

## Dependencies

- Uses existing theme system from ui-theme package
- No external component dependencies
- May use shared button-related type patterns

## Testing Requirements

- Visual verification of all states in ComponentShowcase
- No interactive behavior present
- Proper ellipsis character rendering and alignment

## Implementation Notes

- Convert button element to div with visual styling only
- Remove all onClick and event handlers from extracted code
- Use variant prop to control which visual state is displayed
- Ensure ellipsis character (⋯) is properly centered
- Maintain exact visual spacing and proportions from design

### Log

**2025-07-24T21:59:57.635668Z** - Implemented MenuTriggerDisplay component with visual representation of ellipsis button (⋯) extracted from DesignPrototype.tsx. Component supports four visual states (normal, hover, active, disabled) and two size variants (small, medium) with proper CSS-in-JS styling using theme variables. Includes full TypeScript integration with MenuTriggerVariant type in shared package. Added comprehensive showcase integration demonstrating all visual states and sizes. All quality checks pass with 0 errors.

- filesChanged: ["packages/shared/src/types/ui/components/MenuTriggerVariant.ts", "packages/shared/src/types/ui/components/index.ts", "apps/desktop/src/components/menu/MenuTriggerDisplay.tsx", "apps/desktop/src/components/menu/index.ts", "apps/desktop/src/pages/showcase/ComponentShowcase.tsx"]
