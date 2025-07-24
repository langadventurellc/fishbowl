---
kind: task
id: T-create-dropdownlistdisplay
title: Create DropdownListDisplay component for menu items container
status: open
priority: normal
prerequisites:
  - T-create-menuitemdisplay-component
created: "2025-07-24T16:18:13.799378"
updated: "2025-07-24T16:18:13.799378"
schema_version: "1.1"
parent: F-menu-display-components
---

# Create DropdownListDisplay Component

## Overview

Create a scrollable list container component for displaying multiple MenuItemDisplay components with consistent spacing and borders.

## Implementation Details

### Component Purpose

- List container for multiple MenuItemDisplay components
- Handles scrolling behavior for long lists
- Provides consistent spacing and border styling
- Manages max height and overflow scenarios

### Component Structure

**Component Props Interface** (Create in shared package):

```typescript
// packages/shared/src/types/ui/menu/DropdownListDisplayProps.ts
import { ContextMenuItem } from "./ContextMenuItem";

interface DropdownListDisplayProps {
  items: ContextMenuItem[];
  maxHeight?: number;
  scrollBehavior?: "auto" | "smooth";
  borderStyling?: "none" | "subtle" | "prominent";
  spacing?: "compact" | "normal" | "comfortable";
  className?: string;
}
```

**Component Implementation**:

```typescript
// apps/desktop/src/components/menu/DropdownListDisplay.tsx
import { DropdownListDisplayProps } from "@fishbowl-ai/shared/types/ui/menu";
```

(Implement `scrollBehavior`, `borderStyling`, and `spacing` as named types in TypeScript. See `packages/shared/src/types/ui/core/MessageType.ts` as an example.)

### Visual Features

- **Scrollable container**: Max height with overflow auto
- **Item spacing**: Consistent spacing between menu items
- **Border styling**: Optional border and divider styling
- **List semantics**: Proper list structure for menu items

### Styling Requirements

- Container styling:
  - `display: flex`
  - `flexDirection: column`
  - `maxHeight: configurable (default 300px)`
  - `overflowY: auto`
  - `padding: 4px` (consistent with context menu padding)
  - Optional border and background styling

### Spacing Options

- **compact**: Minimal spacing between items
- **normal**: Standard spacing (matches current design)
- **comfortable**: Generous spacing for accessibility

### File Structure

Create component at: `apps/desktop/src/components/menu/DropdownListDisplay.tsx`

### TypeScript Integration

- **Props interface**: Create `DropdownListDisplayProps` in `packages/shared/src/types/ui/menu/DropdownListDisplayProps.ts`
- **Export from barrel**: Add to `packages/shared/src/types/ui/menu/index.ts`
- Uses existing `ContextMenuItem` interface for item structure
- No interactive handlers in props
- Import props interface from shared package in component implementation

## Acceptance Criteria

✅ **Component Implementation**

- Component file created in correct location
- Props interface for list configuration
- Renders MenuItemDisplay components from items array
- No interactive functionality

✅ **List Display Features**

- Scrollable container with configurable max height
- Consistent spacing between menu items
- Proper list structure and semantics
- Border and styling options working

✅ **Visual Configuration**

- Different spacing options (compact, normal, comfortable)
- Border styling variants
- Max height and scroll behavior configurable
- Proper overflow handling displayed

✅ **Code Quality**

- Component under 100 lines
- TypeScript strict mode compliance
- Clean props interface for configuration
- Proper rendering of child MenuItemDisplay components

✅ **Showcase Integration** (CRITICAL - Done immediately)

- Add component to ComponentShowcase as soon as it's created
- Show different spacing and border configurations
- Display scrollable behavior with many items
- Demonstrate various list lengths and heights

## Dependencies

- Uses MenuItemDisplay component (prerequisite)
- Uses existing theme system for styling
- No external component dependencies

## Testing Requirements

- Visual verification of list behavior in ComponentShowcase
- No interactive behavior present
- Proper scrolling and spacing verification

## Implementation Notes

- Focus on visual list presentation without scroll interaction
- Use flexbox for consistent item spacing
- Support various list configurations for demo purposes
- Ensure proper integration with MenuItemDisplay components
- May use mock data arrays for demonstration in showcase

### Log
