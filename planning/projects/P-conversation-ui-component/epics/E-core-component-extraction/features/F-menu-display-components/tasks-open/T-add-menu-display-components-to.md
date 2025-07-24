---
kind: task
id: T-add-menu-display-components-to
title: Add menu display components to MessageItem following prototype pattern
status: open
priority: normal
prerequisites:
  - T-create-menu-component-barrel
created: "2025-07-24T16:18:55.710944"
updated: "2025-07-24T16:18:55.710944"
schema_version: "1.1"
parent: F-menu-display-components
---

# Add Menu Display Components to MessageItem

## Overview

Create a message-specific context menu component using the generic context menu component from the prerequisite task, then integrate it into the MessageItem component. This creates a reusable bridge between the low-level display components and the MessageItem's specific needs.

## Implementation Details

### Target Files

1. Create `apps/desktop/src/components/chat/MessageContextMenu.tsx` - message-specific context menu component
2. Update `apps/desktop/src/components/chat/MessageItem.tsx` - integrate the new component

### Implementation Strategy

#### Step 1: Create MessageContextMenu Component

Create a reusable message-specific context menu component that:

- Uses the generic ContextMenu component from the prerequisite task
- Accepts message-specific props for actions and configuration
- Handles message-specific logic and menu items
- Provides a clean interface for MessageItem to use

**Component Props Interface** (Create in shared package):

```typescript
// packages/shared/src/types/ui/chat/MessageContextMenuProps.ts
interface MessageContextMenuProps {
  message: Message;
  position?: "above" | "below";
  onCopy: () => void;
  onDelete: () => void;
  onRegenerate?: () => void;
  canRegenerate?: boolean;
}
```

**Component Implementation**:

```typescript
// apps/desktop/src/components/chat/MessageContextMenu.tsx
import { MessageContextMenuProps } from "@fishbowl-ai/shared/types/ui/menu";
import { ContextMenu, MenuItemDisplay } from "./";
```

#### Step 2: Integrate into MessageItem

Replace the existing context menu implementation with the new MessageContextMenu component:

1. **Import the new component**:

   ```typescript
   import { MessageContextMenu } from "@/components/menu/MessageContextMenu";
   import { MenuTriggerDisplay } from "@/components/menu";
   ```

2. **Replace menu trigger**:
   - Use MenuTriggerDisplay for the ellipsis button
   - Maintain existing click handlers and state management

3. **Replace context menu**:
   - Use MessageContextMenu component instead of inline context menu JSX
   - Pass through all necessary props and handlers
   - Preserve positioning logic (above/below)

### Visual Consistency Requirements

- Exact visual match with current MessageItem appearance
- All existing functionality preserved (click handlers, state management)
- No breaking changes to MessageItem props interface
- Maintain theme integration and responsive behavior

### Code Structure

The integration should follow this pattern:

```typescript
// Replace ellipsis button
<MenuTriggerDisplay
  variant={contextMenuOpen === message.id ? 'active' : 'normal'}
  onClick={handleMenuToggle}
/>

// Replace context menu with MessageContextMenu component
{contextMenuOpen === message.id && (
  <MessageContextMenu
    message={message}
    position={shouldShowMenuAbove(message.id) ? 'above' : 'below'}
    onCopy={handleCopy}
    onDelete={handleDelete}
    onRegenerate={handleRegenerate}
    canRegenerate={canRegenerate}
  />
)}
```

### MessageContextMenu Internal Structure

The MessageContextMenu component should internally use the generic ContextMenu:

```typescript
export function MessageContextMenu(props: MessageContextMenuProps) {
  return (
    <ContextMenu position={props.position}>
      <MenuItemDisplay label="Copy" onClick={props.onCopy} />
      <MenuItemDisplay label="Delete" onClick={props.onDelete} />
      {props.canRegenerate && (
        <MenuItemDisplay label="Regenerate" onClick={props.onRegenerate} />
      )}
    </ContextMenu>
  );
}
```

### File Structure

- **Props interface**: `packages/shared/src/types/ui/components/MessageContextMenuProps.ts`
- **Component**: `apps/desktop/src/components/chat/MessageContextMenu.tsx`

### TypeScript Integration

- **Props interface**: Create `MessageContextMenuProps` in `packages/shared/src/types/ui/components/MessageContextMenuProps.ts`
- **Export**: Add to `packages/shared/src/types/ui/components/index.ts` barrel export
- Import props interface from shared package in component implementation

## Acceptance Criteria

✅ **Component Creation**

- MessageContextMenu component created successfully
- MessageContextMenuProps interface created in shared package
- Uses generic ContextMenu component internally
- Provides clean interface for message-specific functionality
- Props interface exported from shared package barrel export
- Component exported from menu components barrel export

✅ **Component Integration**

- MessageContextMenu integrated into MessageItem correctly
- MenuTriggerDisplay used for ellipsis button
- Existing MessageItem functionality preserved completely
- No breaking changes to props interface
- Visual appearance matches current implementation exactly

✅ **Functionality Preservation**

- All click handlers working correctly
- Context menu open/close behavior preserved
- Menu positioning logic (above/below) maintained
- Message-specific menu actions functioning

✅ **Code Quality**

- Clean component usage replacing inline JSX
- Proper import statements from barrel export
- No duplicate styling or redundant code
- TypeScript types preserved and working

✅ **Visual Verification**

- MessageItem appearance unchanged in ComponentShowcase
- Menu interactions working identically to before
- Positioning and styling consistent with prototype
- Theme integration functioning correctly

## Dependencies

- Requires menu component barrel export with generic ContextMenu (prerequisite)
- Uses existing MessageItem component
- Creates new MessageContextMenu component
- Integrates with current theme system
- Maintains existing prop interfaces

## Testing Requirements

- Visual verification in ComponentShowcase
- Functional testing of menu interactions
- No regression in existing MessageItem behavior

## Implementation Notes

- Create a reusable MessageContextMenu component as a bridge between generic components and MessageItem
- This provides a clean abstraction for message-specific context menu functionality
- Focus on maintaining exact existing behavior and appearance
- The MessageContextMenu acts as a facade, using the generic ContextMenu internally
- Preserve all existing event handlers and state management
- Ensure no performance regression from component usage
- The new component should be reusable for other message-related contexts if needed

### Log
