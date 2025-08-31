---
id: T-remove-regenerate-functionalit
title: Remove regenerate functionality from MessageContextMenu
status: open
priority: high
parent: F-implement-message-context
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-31T19:26:17.234Z
updated: 2025-08-31T19:26:17.234Z
---

# Remove Regenerate Functionality from MessageContextMenu

## Context

This task removes all regenerate-related functionality from the message context menu system as requested. This includes removing UI elements, props interfaces, and event handling code while ensuring type safety and maintaining existing copy/delete functionality.

## Implementation Requirements

### 1. Update MessageContextMenu Component

**File**: `apps/desktop/src/components/chat/MessageContextMenu.tsx`

- Remove the regenerate menu item (lines 64-66)
- Remove `onRegenerate` parameter from component props
- Remove `canRegenerate` parameter from component props
- Maintain copy and delete menu items unchanged

### 2. Update MessageContextMenuProps Interface

**File**: `packages/ui-shared/src/types/chat/MessageContextMenuProps.ts`

- Remove `onRegenerate?: () => void` property (line 88)
- Remove `canRegenerate?: boolean` property (lines 97-98)
- Update JSDoc examples to remove regenerate references
- Maintain all other properties unchanged

### 3. Update MessageItem Component

**File**: `apps/desktop/src/components/chat/MessageItem.tsx`

- Remove `handleRegenerate` function (lines 138-140)
- Remove regenerate case from context menu usage
- Remove `canRegenerate` prop from MessageContextMenu calls (lines 353, 412)
- Update JSDoc examples to remove regenerate references
- Maintain existing copy and delete handlers

### 4. Update MessageItemProps Interface

**File**: `packages/ui-shared/src/types/chat/MessageItemProps.ts`

- Remove any regenerate-related properties if present
- Ensure `onContextMenuAction` signature remains unchanged
- Update documentation examples to remove regenerate references

## Technical Approach

1. **Component Updates**: Remove regenerate menu item from MessageContextMenu component
2. **Props Interface**: Clean up TypeScript interfaces to remove regenerate properties
3. **Event Handling**: Remove regenerate event handling while preserving copy/delete
4. **Documentation**: Update JSDoc comments and examples
5. **Testing**: Ensure unit tests pass after regenerate removal

## Acceptance Criteria

- ✅ Regenerate menu item is completely removed from context menu
- ✅ `onRegenerate` and `canRegenerate` props are removed from interfaces
- ✅ All regenerate event handling code is removed
- ✅ TypeScript compilation succeeds without errors
- ✅ Copy and delete functionality remains unaffected
- ✅ Unit tests pass after changes
- ✅ No regenerate references remain in component documentation

## Out of Scope

- Do not modify copy or delete functionality
- Do not modify any database or service layers
- Do not modify parent components that call MessageItem
- Do not create new functionality in this task

## Testing Requirements

- Write unit tests to verify regenerate menu item is not rendered
- Update existing unit tests that check for regenerate functionality
- Ensure copy and delete menu items still render correctly
- Verify TypeScript interfaces are properly updated

## Dependencies

None - this task can be completed independently.

## Security Considerations

No security implications - this is purely removing existing UI functionality.

## Performance Requirements

No performance impact - removing code should slightly improve performance.
