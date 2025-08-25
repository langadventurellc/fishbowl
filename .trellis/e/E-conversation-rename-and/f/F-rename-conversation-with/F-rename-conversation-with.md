---
id: F-rename-conversation-with
title: Rename Conversation with Modal Dialog
status: done
priority: medium
parent: E-conversation-rename-and
prerequisites: []
affectedFiles:
  apps/desktop/src/electron/conversationsHandlers.ts: Added UPDATE IPC handler
    following the existing CREATE/LIST/GET/DELETE pattern. Imports
    ConversationsUpdateRequest and ConversationsUpdateResponse types, registers
    handler for CONVERSATION_CHANNELS.UPDATE channel, calls
    conversationsRepository.update() with request.id and request.updates,
    returns success response with updated conversation data, and handles errors
    with logger.error and serializeError.
  apps/desktop/src/electron/__tests__/conversationsHandlers.test.ts:
    Added comprehensive unit tests for UPDATE handler including successful
    update scenario, ConversationNotFoundError handling, database error
    handling, and updated handler registration test to verify UPDATE handler is
    properly registered. All tests follow existing patterns and verify proper
    repository method calls, response formats, and error serialization.
  apps/desktop/src/electron/preload.ts: Added update method to
    electronAPI.conversations object following existing create/list/get/delete
    patterns. Imported ConversationsUpdateRequest, ConversationsUpdateResponse,
    and UpdateConversationInput types. Method properly invokes
    CONVERSATION_CHANNELS.UPDATE with correct parameters, handles success/error
    responses, and includes comprehensive error logging.
  apps/desktop/src/electron/__tests__/preload.conversations.test.ts:
    Added comprehensive unit tests for conversations.update method including
    successful update scenario, error response handling, IPC communication error
    handling, contextBridge integration verification, and error logging tests.
    Updated contextBridge integration tests to verify update method is properly
    exposed. All 38 tests passing including new update method coverage.
  apps/desktop/src/hooks/conversations/useUpdateConversation.ts:
    Created useUpdateConversation hook following established patterns with IPC
    integration, loading states, error handling, and environment validation;
    Fully implemented hook with loading states, error handling, Electron
    environment validation, and proper TypeScript types
  apps/desktop/src/components/modals/RenameConversationModal.tsx:
    Implemented comprehensive rename modal with shadcn/ui Dialog, auto-focus,
    keyboard shortcuts, validation, loading states, and error handling
  packages/ui-shared/src/types/chat/RenameConversationModalProps.ts: Added props interface for rename modal component
  packages/ui-shared/src/types/chat/index.ts: Exported RenameConversationModalProps for use in desktop app
  packages/ui-shared/src/types/chat/ConversationItemDisplayProps.ts: Added onRename callback prop to enable context menu integration
  apps/desktop/src/components/sidebar/ConversationItemDisplay.tsx: Updated to accept and pass through onRename prop to context menu
  apps/desktop/src/components/sidebar/SidebarContainerDisplay.tsx:
    Integrated rename modal with state management, conversion between
    ConversationViewModel and Conversation types, and automatic refresh after
    successful rename
  apps/desktop/src/hooks/conversations/__tests__/useUpdateConversation.test.tsx:
    Comprehensive unit tests for useUpdateConversation hook covering success
    scenarios, error handling, loading states, environment validation, and
    memory cleanup (27 test cases); Comprehensive test suite with 17 tests
    covering success scenarios, error handling, loading states, environment
    validation, and memory cleanup
log:
  - "Auto-completed: All child tasks are complete"
schema: v1.0
childrenIds:
  - T-create-renameconversationmodal
  - T-create-useupdateconversation
  - T-expose-update-method-in
  - T-implement-update-ipc-handler
  - T-wire-up-rename-modal-in
created: 2025-08-24T19:44:59.011Z
updated: 2025-08-24T19:44:59.011Z
---

# Rename Conversation with Modal Dialog

## Purpose and Functionality

Implement the ability for users to rename conversations through a modal dialog interface, providing a clean and consistent user experience for modifying conversation titles in the sidebar.

## Key Components to Implement

### 1. IPC Handler Layer

- Implement UPDATE handler in `apps/desktop/src/electron/conversationsHandlers.ts`
- Connect to existing `ConversationsRepository.update()` method
- Add error handling and logging following CREATE/LIST patterns
- Validate conversation ID and title input

### 2. Frontend Hook - useUpdateConversation

- Create `apps/desktop/src/hooks/conversations/useUpdateConversation.ts`
- Follow the pattern established by `useCreateConversation` hook
- Include loading state management (`isUpdating`)
- Implement error state handling
- Provide reset function for clearing errors
- Use electronAPI.conversations.update for IPC communication

### 3. Rename Modal Component

- Create modal dialog component for rename operation
- Include text input field pre-populated with current title
- Add Save and Cancel buttons
- Implement keyboard support (Enter to save, Escape to cancel)
- Show loading state during update operation
- Display error messages if update fails

### 4. UI Integration

- Wire up "Rename conversation" menu item in ConversationContextMenu
- Pass conversation data to modal when triggered
- Update ConversationItemDisplay to refresh after successful rename
- Ensure sidebar list updates immediately after rename

### 5. Type Definitions

- Extend ConversationsAPI interface with update method (already marked optional)
- Add IPC request/response types for UPDATE operation
- Ensure preload script exposes update method

## Detailed Acceptance Criteria

### Functional Requirements

- ✅ User clicks "Rename conversation" in context menu → modal dialog opens
- ✅ Modal shows current conversation title in editable text field
- ✅ User can modify title and click Save to update
- ✅ User can click Cancel or press Escape to abort operation
- ✅ Pressing Enter in text field triggers save action
- ✅ Empty titles are rejected with validation error
- ✅ Title updates persist to SQLite database via IPC
- ✅ Sidebar immediately reflects new title after successful update
- ✅ Loading indicator shows during update operation
- ✅ Error messages display if update fails

### Input Validation

- ✅ Title cannot be empty string
- ✅ Title must be trimmed of leading/trailing whitespace
- ✅ Maximum title length enforced (if defined in schema)
- ✅ Special characters are properly handled

### Error Handling

- ✅ Show user-friendly message for validation errors
- ✅ Handle case where conversation no longer exists
- ✅ Display generic error message for unexpected database errors
- ✅ Modal remains open on error, allowing user to retry

### UI/UX Requirements

- ✅ Modal overlays the application with backdrop
- ✅ Focus automatically set to text input when modal opens
- ✅ Text is pre-selected for easy replacement
- ✅ Modal is centered on screen
- ✅ Consistent styling with existing modal patterns

## Technical Requirements

### Dependencies

- Existing `ConversationsRepository.update()` method
- `CONVERSATION_CHANNELS.UPDATE` channel constant
- `UpdateConversationInput` type from shared package
- Existing modal/dialog component patterns in codebase

### Implementation Patterns

- Follow dependency injection pattern with useServices hook
- Use Zustand store for state management if needed
- Implement proper cleanup in useEffect hooks
- Follow existing error serialization patterns

## Testing Requirements

- Unit test for useUpdateConversation hook
- Test loading states and error handling
- Test validation logic for empty/invalid titles
- Test keyboard navigation (Enter/Escape)
- Verify IPC handler properly calls repository method
- Test error propagation from repository to UI

## Security Considerations

- Validate conversation ID format before database operation
- Sanitize title input to prevent injection attacks
- Ensure proper error messages don't expose system details

## Performance Requirements

- Update operation completes instantly (local SQLite)
- No UI blocking during update operation
- Modal opens/closes without lag
