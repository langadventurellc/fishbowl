---
kind: task
id: T-create-contextmenudisplay
title: Create ContextMenuDisplay component with visual states
status: open
priority: high
prerequisites: []
created: "2025-07-24T16:17:01.998562"
updated: "2025-07-24T16:17:01.998562"
schema_version: "1.1"
parent: F-menu-display-components
---

# Create ContextMenuDisplay Component

## Overview

Extract and implement the ContextMenuDisplay component from DesignPrototype.tsx, focusing on visual representation without interactive functionality.

## Implementation Details

### Source Reference

- **Primary Source**: `apps/desktop/src/pages/DesignPrototype.tsx` (lines 526-571)
- **Styling Objects**: `contextMenu`, `contextMenuAbove`, `contextMenuItem` styles
- **Theme System**: Uses CSS variables from `packages/ui-theme/src/claymorphism-theme.css`

### Component Structure

```typescript
// apps/desktop/src/components/menu/ContextMenuDisplay.tsx
interface ContextMenuDisplayProps {
  isOpen: boolean;
  position: "above" | "below";
  items: MenuItemData[];
  className?: string;
}
```

(Implement `position` as named types in TypeScript. See `packages/shared/src/types/ui/core/MessageType.ts` as an example.)

### Visual States to Support

- **visible**: Menu displayed with proper positioning and backdrop
- **hidden**: Menu not rendered (controlled by isOpen prop)
- **positioned**: Different positioning (above/below) with proper margins

### Styling Requirements

- Extract styling from DesignPrototype's `contextMenu` and `contextMenuAbove` objects
- Convert to CSS-in-JS using theme variables:
  - `backgroundColor: var(--popover)`
  - `border: 1px solid var(--border)`
  - `borderRadius: 6px`
  - `boxShadow: 0 4px 12px rgba(0, 0, 0, 0.15)`
  - `padding: 4px`
  - `minWidth: 140px`
  - `zIndex: 1000`

### File Structure

Create component at: `apps/desktop/src/components/menu/ContextMenuDisplay.tsx`

### TypeScript Integration

- Import types from `packages/shared/src/types/ui/components/`
- Use `ContextMenuProps` interface pattern for props
- Create internal `MenuItemData` interface for item structure

## Acceptance Criteria

✅ **Component Implementation**

- Component file created in correct location
- Props interface matches ContextMenuProps pattern
- No interactive handlers (onClick, onClose, etc.)
- Pure visual representation only

✅ **Visual Fidelity**

- Exact match with DesignPrototype context menu appearance
- Positioning logic for above/below states
- Proper shadow and border styling preserved
- Theme variable integration working correctly

✅ **Positioning Display**

- Menu positioning relative to trigger elements (via props)
- Z-index layering for proper visual stacking
- Above/below positioning with proper margins
- Edge-case positioning considerations in styling

✅ **Code Quality**

- Component under 100 lines
- TypeScript strict mode compliance
- No added interactive functionality
- Pure CSS-in-JS styling with theme variables

✅ **Showcase Integration** (CRITICAL - Done immediately)

- Add component to ComponentShowcase as soon as it's created
- Show different positioning states (above/below)
- Display various menu configurations
- Demonstrate open/closed visual states

## Dependencies

- Uses existing theme system from ui-theme package
- May reference shared type interfaces
- No external component dependencies

## Testing Requirements

- Visual verification in ComponentShowcase
- No interactive behavior present
- Proper positioning and styling verification

## Implementation Notes

- Remove all onClick, onToggle, menu interaction handlers from extracted code
- Focus purely on visual styling objects and positioning logic
- Convert DesignPrototype's inline styles to component-based CSS-in-JS
- Preserve exact visual appearance and spacing

### Log
