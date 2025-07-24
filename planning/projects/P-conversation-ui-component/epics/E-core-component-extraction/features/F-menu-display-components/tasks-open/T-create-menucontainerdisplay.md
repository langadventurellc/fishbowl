---
kind: task
id: T-create-menucontainerdisplay
title: Create MenuContainerDisplay component for positioning
status: open
priority: normal
prerequisites:
  - T-create-contextmenudisplay
created: "2025-07-24T16:17:56.773095"
updated: "2025-07-24T16:17:56.773095"
schema_version: "1.1"
parent: F-menu-display-components
---

# Create MenuContainerDisplay Component

## Overview

Create a wrapper component for positioning and styling context menus with proper layering and backdrop effects.

## Implementation Details

### Component Purpose

- Wrapper for positioning ContextMenuDisplay components
- Handles absolute positioning with coordinate-based placement
- Manages z-index layering for proper visual stacking
- Provides backdrop and overlay visual effects

### Component Structure

**Component Props Interface** (Create in shared package):

```typescript
// packages/shared/src/types/ui/menu/MenuContainerDisplayProps.ts
interface MenuContainerDisplayProps {
  position: { x: number; y: number };
  zIndex?: number;
  backdropVisible?: boolean;
  children: React.ReactNode;
  className?: string;
}
```

**Component Implementation**:

```typescript
// apps/desktop/src/components/menu/MenuContainerDisplay.tsx
import { MenuContainerDisplayProps } from "@fishbowl-ai/shared/types/ui/menu";
```

### Visual Features

- **Absolute positioning**: Position menus at specific coordinates
- **Z-index management**: Proper layering (default z-index: 1000)
- **Backdrop overlay**: Optional backdrop visibility for modal-like behavior
- **Viewport boundaries**: Visual representation of edge-case positioning

### Styling Requirements

- Container with absolute positioning
- Configurable z-index for proper stacking
- Optional backdrop overlay styling:
  - `position: fixed`
  - `top: 0`
  - `left: 0`
  - `right: 0`
  - `bottom: 0`
  - `backgroundColor: transparent` (or semi-transparent for demo)
  - Lower z-index than menu content

### File Structure

Create component at: `apps/desktop/src/components/menu/MenuContainerDisplay.tsx`

### TypeScript Integration

- **Props interface**: Create `MenuContainerDisplayProps` in `packages/shared/src/types/ui/menu/MenuContainerDisplayProps.ts`
- **Export from barrel**: Add to `packages/shared/src/types/ui/menu/index.ts`
- Children prop for wrapping ContextMenuDisplay
- No interactive handlers
- Import props interface from shared package in component implementation

## Acceptance Criteria

✅ **Component Implementation**

- Component file created in correct location
- Props interface for position coordinates and configuration
- Wrapper component that renders children at specified position
- No interactive functionality

✅ **Positioning Display**

- Absolute positioning working with x/y coordinates
- Z-index layering configurable and functional
- Backdrop overlay option working correctly
- Edge-case positioning scenarios supported

✅ **Visual Integration**

- Works as wrapper for ContextMenuDisplay component
- Proper layering with other UI elements
- Backdrop overlay styling when enabled
- Viewport boundary considerations in styling

✅ **Code Quality**

- Component under 80 lines
- TypeScript strict mode compliance
- Clean props interface for positioning
- Flexible children rendering

✅ **Showcase Integration** (CRITICAL - Done immediately)

- Add component to ComponentShowcase as soon as it's created
- Show different positioning scenarios
- Demonstrate z-index layering effects
- Display with and without backdrop overlay

## Dependencies

- Works with ContextMenuDisplay component (prerequisite)
- Uses existing theme system for backdrop styling
- No external component dependencies

## Testing Requirements

- Visual verification of positioning in ComponentShowcase
- No interactive behavior present
- Proper layering and backdrop verification

## Implementation Notes

- Focus on visual positioning representation
- Support various positioning scenarios for demo purposes
- Ensure proper z-index management for menu stacking
- Optional backdrop should be visually subtle but demonstrable

### Log
