---
id: F-delete-conversation-with
title: Delete Conversation with Confirmation
status: done
priority: medium
parent: E-conversation-rename-and
prerequisites: []
affectedFiles:
  apps/desktop/src/electron/conversationsHandlers.ts: Added DELETE IPC handler
    with proper error handling, logging, and response formatting following
    CREATE/LIST/GET patterns
  apps/desktop/src/electron/__tests__/conversationsHandlers.test.ts:
    Created comprehensive test suite for all conversation handlers including the
    new DELETE handler with success, error, and edge case scenarios
  apps/desktop/src/electron/preload.ts: Added ConversationsDeleteRequest and
    ConversationsDeleteResponse imports and implemented the delete method in the
    conversations API following existing patterns with proper error handling and
    TypeScript types
  apps/desktop/src/electron/__tests__/preload.conversations.test.ts:
    Added comprehensive unit tests for the delete method including
    success/failure scenarios, error handling, IPC communication errors,
    contextBridge integration, and error logging verification
  apps/desktop/src/components/sidebar/DeleteConversationModal.tsx:
    Created new modal component for conversation deletion confirmation following
    DeletePersonalityDialog pattern with proper styling, error handling, and
    logging
  packages/ui-shared/src/types/ConversationViewModel.ts: Added id field to
    ConversationViewModel interface to support deletion and other operations
    requiring unique identification
  packages/ui-shared/src/types/chat/ConversationItemDisplayProps.ts:
    Added optional onDelete callback prop to support delete functionality in
    conversation items
  apps/desktop/src/components/sidebar/SidebarContainerDisplay.tsx:
    Integrated DeleteConversationModal with proper state management, delete
    handlers, and IPC communication for conversation deletion
  apps/desktop/src/components/sidebar/ConversationItemDisplay.tsx:
    Updated component to pass onDelete prop to ConversationContextMenu for modal
    integration
  apps/desktop/src/hooks/conversations/useDeleteConversation.ts:
    React hook for deleting conversations with loading states, error handling,
    and IPC communication following useCreateConversation pattern
  apps/desktop/src/hooks/conversations/__tests__/useDeleteConversation.test.tsx:
    Comprehensive unit tests covering success/failure scenarios, loading states,
    error handling, environment checks, and function stability
  apps/desktop/src/hooks/conversations/index.ts: Barrel export file properly exports useDeleteConversation hook
log:
  - "Auto-completed: All child tasks are complete"
schema: v1.0
childrenIds:
  - T-create-deleteconversationmodal
  - T-create-usedeleteconversation
  - T-expose-delete-method-in
  - T-implement-delete-ipc-handler
  - T-wire-up-delete-modal-and
created: 2025-08-24T19:46:00.633Z
updated: 2025-08-24T19:46:00.633Z
---

# Delete Conversation with Confirmation Dialog

## Purpose and Functionality

Implement the ability for users to permanently delete conversations through a confirmation dialog, ensuring users understand the irreversible nature of the operation while providing a smooth deletion workflow.

## Key Components to Implement

### 1. IPC Handler Layer

- Implement DELETE handler in `apps/desktop/src/electron/conversationsHandlers.ts`
- Connect to existing `ConversationsRepository.delete()` method
- Add error handling and logging following CREATE/LIST patterns
- Validate conversation ID before deletion
- Return success/failure status to renderer

### 2. Frontend Hook - useDeleteConversation

- Create `apps/desktop/src/hooks/conversations/useDeleteConversation.ts`
- Follow the pattern established by `useCreateConversation` hook
- Include loading state management (`isDeleting`)
- Implement error state handling
- Provide reset function for clearing errors
- Use electronAPI.conversations.delete for IPC communication

### 3. Delete Confirmation Modal

- Create confirmation dialog component for delete operation
- Display conversation title in confirmation message
- Show clear warning about permanent deletion
- Include "Delete" (danger style) and "Cancel" buttons
- Implement keyboard support (Escape to cancel)
- Show loading state during delete operation
- Display error messages if deletion fails

### 4. UI Integration

- Wire up "Delete conversation" menu item in ConversationContextMenu
- Pass conversation data to confirmation modal
- Remove conversation from sidebar list after successful deletion
- Handle case where deleted conversation was currently active
- Redirect to another conversation or show empty state

### 5. Type Definitions

- Extend ConversationsAPI interface with delete method (already marked optional)
- Add IPC request/response types for DELETE operation
- Ensure preload script exposes delete method

## Detailed Acceptance Criteria

### Functional Requirements

- ✅ User clicks "Delete conversation" in context menu → confirmation dialog opens
- ✅ Confirmation dialog clearly shows conversation title being deleted
- ✅ Warning message explains deletion is permanent and cannot be undone
- ✅ User must click "Delete" button to confirm (no accidental deletions)
- ✅ User can click Cancel or press Escape to abort operation
- ✅ Delete operation removes conversation from SQLite database (hard delete)
- ✅ Sidebar immediately removes deleted conversation from list
- ✅ Loading indicator shows during delete operation
- ✅ Error messages display if deletion fails

### Deletion Behavior

- ✅ Conversation is permanently removed from database (not soft delete)
- ✅ All associated data is cleaned up
- ✅ If deleted conversation was active, UI handles transition gracefully
- ✅ No orphaned references remain after deletion

### Error Handling

- ✅ Handle case where conversation no longer exists
- ✅ Display user-friendly message for database errors
- ✅ Modal closes only after successful deletion
- ✅ On error, modal remains open allowing retry or cancel

### UI/UX Requirements

- ✅ Confirmation modal uses danger/warning styling
- ✅ Delete button styled as destructive action (red/danger color)
- ✅ Modal overlays application with backdrop
- ✅ Clear, unambiguous warning text about permanence
- ✅ Modal is centered on screen
- ✅ Consistent styling with existing modal patterns

## Technical Requirements

### Dependencies

- Existing `ConversationsRepository.delete()` method
- `CONVERSATION_CHANNELS.DELETE` channel constant
- Existing modal/dialog component patterns in codebase
- Conversation list state management

### Implementation Patterns

- Follow dependency injection pattern with useServices hook
- Update conversation list state after successful deletion
- Implement proper cleanup in useEffect hooks
- Follow existing error serialization patterns

## Testing Requirements

- Unit test for useDeleteConversation hook
- Test loading states and error handling
- Test confirmation flow (cancel vs confirm)
- Test keyboard navigation (Escape to cancel)
- Verify IPC handler properly calls repository method
- Test conversation removal from UI after deletion
- Verify hard delete in database (not soft delete)

## Security Considerations

- Validate conversation ID format before database operation
- Ensure deletion cannot be triggered without explicit confirmation
- Proper error messages don't expose system details
- No way to bypass confirmation dialog

## Performance Requirements

- Delete operation completes instantly (local SQLite)
- No UI blocking during delete operation
- Modal opens/closes without lag
- Sidebar updates immediately after successful deletion
