---
kind: task
id: T-create-generic-contextmenu
parent: F-menu-display-components
status: done
title: Create generic ContextMenu component with trigger and dropdown
priority: normal
prerequisites:
  - T-create-menu-component-barrel
created: "2025-07-24T17:43:32.855551"
updated: "2025-07-24T18:33:11.398769"
schema_version: "1.1"
worktree: null
---

Create a generic ContextMenu component that combines the MenuTriggerDisplay and ContextMenuDisplay components with basic open/close functionality. This component will handle the interaction pattern while accepting children for menu content, providing a reusable solution for both sidebar conversation menus and message context menus.

## Implementation Details

### Component Purpose

- Combines trigger + dropdown with open/close state management
- Accepts children for flexible menu content composition
- Handles basic interaction pattern (click to open/close)
- Provides positioning options for different use cases
- No callbacks for menu item actions (children handle their own interactions)

### Component Structure

**Component Props Interface** (Create in shared package):

```typescript
// packages/shared/src/types/ui/menu/ContextMenuProps.ts
// NOTE: This already exists - verify it matches our needs or update accordingly

interface ContextMenuProps {
  trigger?: React.ReactNode; // Custom trigger or uses default ellipsis
  position?: "above" | "below" | "auto";
  children: React.ReactNode; // Menu items as children
  className?: string;
  disabled?: boolean; // Disable the entire menu
}
```

**Component Implementation**:

```typescript
// apps/desktop/src/components/menu/ContextMenu.tsx
import { ContextMenuProps } from "@fishbowl-ai/shared/types/ui/menu";
import { MenuTriggerDisplay, ContextMenuDisplay } from "./";
```

### Functionality Requirements

- **State management**: Internal `isOpen` state for menu visibility
- **Click handling**: Toggle menu open/close on trigger click
- **Outside clicks**: Close menu when clicking outside (optional behavior)
- **Keyboard support**: ESC key to close menu
- **Positioning**: Support 'above', 'below', or 'auto' positioning
- **Custom trigger**: Accept custom trigger element or use default ellipsis

### Usage Examples

```typescript
// Sidebar conversation menu
<ContextMenu>
  <MenuItemDisplay label="Rename" />
  <MenuItemDisplay label="Delete" variant="danger" />
</ContextMenu>

// Message context menu with custom positioning
<ContextMenu position="above">
  <MenuItemDisplay label="Copy" />
  <MenuItemDisplay label="Regenerate" />
  <MenuItemDisplay label="Delete" variant="danger" />
</ContextMenu>

// Custom trigger
<ContextMenu trigger={<CustomButton />}>
  <MenuItemDisplay label="Action 1" />
  <MenuItemDisplay label="Action 2" />
</ContextMenu>
```

### Integration with Display Components

- Uses `MenuTriggerDisplay` for the trigger element
- Uses `ContextMenuDisplay` for the dropdown container
- Children are rendered inside `ContextMenuDisplay`
- Maintains visual consistency with existing display components

### File Structure

Create component at: `apps/desktop/src/components/menu/ContextMenu.tsx`

### TypeScript Integration

- **Props interface**: Verify existing `ContextMenuProps` in `packages/shared/src/types/ui/menu/ContextMenuProps.ts` matches needs
- **Update if needed**: Modify existing interface to support new requirements
- **Export from barrel**: Ensure it's exported from `packages/shared/src/types/ui/menu/index.ts`
- Import props interface from shared package in component implementation

## Acceptance Criteria

✅ **Component Implementation**

- Component file created in correct location
- Uses existing display components (MenuTriggerDisplay, ContextMenuDisplay)
- Internal state management for open/close behavior
- Flexible children composition for menu content

✅ **Interaction Features**

- Click trigger to open/close menu
- Optional outside click to close
- ESC key support to close menu
- Position configuration (above/below/auto)
- Custom trigger support

✅ **Integration Quality**

- Uses existing MenuTriggerDisplay and ContextMenuDisplay components
- Props interface properly defined in shared package
- Clean composition pattern with children
- No callback props for menu item actions

✅ **Code Quality**

- Component under 150 lines
- TypeScript strict mode compliance
- Clean props interface
- Proper state management with hooks

✅ **Showcase Integration** (CRITICAL - Done immediately)

- Add component to ComponentShowcase as soon as it's created
- Show different positioning scenarios
- Demonstrate custom trigger usage
- Display various menu content compositions
- Show disabled state

## Dependencies

- Uses MenuTriggerDisplay component (prerequisite via barrel)
- Uses ContextMenuDisplay component (prerequisite via barrel)
- Uses existing theme system for styling
- May update existing ContextMenuProps interface

## Testing Requirements

- Visual verification in ComponentShowcase
- Interaction testing (open/close behavior)
- Keyboard navigation testing
- Position configuration verification

## Implementation Notes

- Focus on providing the interaction pattern while keeping menu items as pure display
- The generic component handles open/close state, children handle their own display
- Support both default ellipsis trigger and custom trigger elements
- Ensure proper integration with existing display component styling
- Consider click-outside behavior but make it configurable

### Log

### Log

**2025-07-24T23:40:31.912619Z** - Implemented generic ContextMenu component with trigger and dropdown functionality. This component combines MenuTriggerDisplay and ContextMenuDisplay with internal state management for open/close behavior. Features include: internal isOpen state with useState, click handling for trigger toggle, position support (above/below/auto), custom trigger or default ellipsis button, children composition pattern for flexible menu content, keyboard support (ESC key to close), and click-outside-to-close functionality. Component added to ComponentShowcase with multiple usage examples demonstrating all features. All quality checks pass (lint, format, type-check).

- filesChanged: ["packages/shared/src/types/ui/menu/ContextMenuProps.ts", "apps/desktop/src/components/menu/ContextMenu.tsx", "apps/desktop/src/components/menu/index.ts", "apps/desktop/src/pages/showcase/ComponentShowcase.tsx"]
