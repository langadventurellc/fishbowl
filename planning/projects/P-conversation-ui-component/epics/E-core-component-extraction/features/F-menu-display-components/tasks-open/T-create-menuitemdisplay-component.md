---
kind: task
id: T-create-menuitemdisplay-component
title: Create MenuItemDisplay component with state visualization
status: open
priority: high
prerequisites: []
created: "2025-07-24T16:17:19.162194"
updated: "2025-07-24T16:17:19.162194"
schema_version: "1.1"
parent: F-menu-display-components
---

# Create MenuItemDisplay Component

## Overview

Extract and implement the MenuItemDisplay component from DesignPrototype.tsx, focusing on individual menu item visual representation.

## Implementation Details

### Source Reference

- **Primary Source**: `apps/desktop/src/pages/DesignPrototype.tsx` (lines 551-571)
- **Styling Objects**: `contextMenuItem`, `contextMenuItemHover`, `contextMenuItemDisabled` styles
- **Interactive Elements**: Button elements within context menus

### Component Structure

```typescript
// apps/desktop/src/components/menu/MenuItemDisplay.tsx
interface MenuItemDisplayProps {
  label: string;
  icon?: string;
  disabled?: boolean;
  separator?: boolean;
  danger?: boolean;
  variant?: "normal" | "hover" | "disabled" | "danger";
  className?: string;
}
```

(Implement `variant` as named types in TypeScript. See `packages/shared/src/types/ui/core/MessageType.ts` as an example.)

### Visual States to Support

- **normal**: Default menu item appearance
- **hover**: Visual hover state (without actual hover behavior)
- **disabled**: Grayed out appearance with reduced opacity
- **danger**: Red/warning styling for destructive actions

### Styling Requirements

- Extract styling from DesignPrototype's `contextMenuItem` object:
  - `display: block`
  - `width: 100%`
  - `padding: 8px 12px`
  - `fontSize: 13px`
  - `color: var(--popover-foreground)`
  - `backgroundColor: transparent`
  - `border: none`
  - `borderRadius: 4px`
  - `cursor: pointer` (visual only)
  - `textAlign: left`
  - `transition: background-color 0.15s`

### Hover State Styling

- From `contextMenuItemHover`:
  - `backgroundColor: var(--accent)`
  - `color: var(--accent-foreground)`

### Disabled State Styling

- From `contextMenuItemDisabled`:
  - `opacity: 0.5`
  - `cursor: not-allowed`

### File Structure

Create component at: `apps/desktop/src/components/menu/MenuItemDisplay.tsx`

### TypeScript Integration

- Use `ContextMenuItem` interface pattern for base props
- Extend with display-specific props (variant, etc.)
- No interactive handlers in props interface

## Acceptance Criteria

✅ **Component Implementation**

- Component file created in correct location
- Props interface for visual configuration
- No click handlers or interactive functionality
- Pure visual representation with state props

✅ **Visual State Display**

- All menu item states (normal, hover, disabled, danger) rendered
- Proper styling for each state variant
- Icon support and alignment (if icon provided)
- Text styling and typography preserved

✅ **Visual Fidelity**

- Exact match with DesignPrototype menu item appearance
- Proper padding, font sizes, and spacing
- Color scheme using theme variables
- Hover appearance (without actual hover)

✅ **Code Quality**

- Component under 75 lines
- TypeScript strict mode compliance
- No added interactive functionality
- Clean props interface for visual configuration

✅ **Showcase Integration** (CRITICAL - Done immediately)

- Add component to ComponentShowcase as soon as it's created
- Show all visual states (normal, hover, disabled, danger)
- Display with and without icons
- Demonstrate separator and label variations

## Dependencies

- Uses existing theme system from ui-theme package
- May reference ContextMenuItem interface pattern
- No external component dependencies

## Testing Requirements

- Visual verification of all states in ComponentShowcase
- No interactive behavior present
- Proper typography and spacing verification

## Implementation Notes

- Convert button element to div with visual styling only
- Remove all onClick and event handlers from extracted code
- Focus on replicating visual appearance exactly
- Use variant prop to control which visual state is displayed
- Support both icon and text-only menu items

### Log
