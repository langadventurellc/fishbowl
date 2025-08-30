---
id: T-wire-messageitem-checkboxes
title: Wire MessageItem checkboxes to useUpdateMessage hook
status: open
priority: high
parent: F-message-context-control
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-30T06:19:58.386Z
updated: 2025-08-30T06:19:58.386Z
---

# Wire MessageItem checkboxes to useUpdateMessage hook

## Context

The MessageItem component currently has inclusion checkboxes that only update local state (`isActive`). These need to be connected to the `useUpdateMessage` hook to persist inclusion changes to the database and provide proper loading/error states.

## Technical Implementation

**File to modify:** `apps/desktop/src/components/chat/MessageItem.tsx`

### Step 1: Add useUpdateMessage hook integration

- Import and use `useUpdateMessage` hook in the MessageItem component
- Replace local `handleToggleContext` with actual database updates
- Add optimistic UI updates with error rollback

### Step 2: Update checkbox interaction logic

- Call `updateInclusion(message.id, newActiveState)` on checkbox click
- Show loading state during update (disable checkbox temporarily)
- Handle update errors gracefully with user feedback
- Reset to previous state on error

### Step 3: Add proper state synchronization

- Use `message.isActive` from props as source of truth
- Remove local `isActive` state management
- Ensure checkbox state reflects actual database state

## Detailed Acceptance Criteria

### Checkbox Integration

- **WHEN** user clicks inclusion checkbox
- **THEN** it should call `useUpdateMessage.updateInclusion()` with message ID and new state
- **AND** show visual loading feedback during the API call
- **AND** update the checkbox state immediately (optimistic update)

### Loading States

- **WHEN** message inclusion is being updated
- **THEN** the checkbox should be disabled and show loading indicator
- **AND** user should see visual feedback that update is in progress

### Error Handling

- **WHEN** inclusion update fails
- **THEN** checkbox should revert to previous state
- **AND** display error message to user
- **AND** provide retry option or clear error guidance

### State Consistency

- **WHEN** component receives updated message props
- **THEN** checkbox state should reflect `message.isActive` value
- **AND** no stale local state should override database state

## Testing Requirements

Include unit tests for:

- Checkbox integration with useUpdateMessage hook
- Loading state display during updates
- Error handling and state rollback
- Optimistic UI updates
- Accessibility of loading/error states

## Implementation Notes

- Use optimistic updates for immediate UI feedback
- Handle loading state with subtle visual changes (opacity, spinner)
- Keep error messages user-friendly and actionable
- Maintain existing accessibility features
- Follow existing error handling patterns in the codebase

## Out of Scope

- Do not modify the useUpdateMessage hook implementation
- Do not change the MessageItem props interface
- Do not add bulk operations or context statistics in this task
