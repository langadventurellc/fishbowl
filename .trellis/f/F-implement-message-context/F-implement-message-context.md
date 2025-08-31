---
id: F-implement-message-context
title: Implement Message Context Menu Actions
status: done
priority: medium
prerequisites: []
affectedFiles:
  apps/desktop/src/components/chat/MessageContextMenu.tsx:
    Removed regenerate menu
    item from context menu while preserving props interface for future
    functionality
  packages/shared/src/services/clipboard/ClipboardBridge.ts: Created clipboard
    bridge interface with comprehensive documentation and examples
  packages/shared/src/services/clipboard/index.ts: Added clipboard service exports
  apps/desktop/src/renderer/services/BrowserClipboardService.ts: Implemented browser clipboard service with modern API and legacy fallback
  apps/desktop/src/main/services/NodeClipboardService.ts: Implemented Node.js clipboard service using Electron's clipboard API
  packages/shared/src/services/messaging/MessageActionsService.ts:
    Created message actions service with dependency injection and content
    sanitization; Extended with deleteMessage method using dependency injection
    for database operations, comprehensive input validation, and error handling
  packages/shared/src/services/messaging/index.ts: Added messaging service exports
  packages/shared/src/services/index.ts: Updated main service exports to include clipboard and messaging modules
  packages/shared/src/repositories/messages/MessageRepository.ts:
    Added delete method with validation, existence checking, and proper error
    handling following existing repository patterns
  packages/shared/src/repositories/messages/__tests__/MessageRepository.test.ts:
    Added comprehensive unit tests for delete functionality covering success
    cases, validation errors, constraint violations, and edge cases
  packages/shared/src/services/messaging/__tests__/MessageActionsService.test.ts:
    Created complete test suite for MessageActionsService with tests for both
    copy and delete functionality, including error scenarios and validation
  apps/desktop/src/renderer/services/RendererProcessServices.ts:
    Added clipboard bridge integration with BrowserClipboardService dependency
    injection
  apps/desktop/src/hooks/services/useMessageActions.ts: Created message actions
    hook with clipboard dependency injection and copy functionality; Enhanced
    hook to provide real delete functionality via Electron IPC alongside
    existing copy functionality
  apps/desktop/src/components/layout/MainContentPanelDisplay.tsx:
    Updated context menu handler to use real copy implementation with error
    handling; Extended context menu handler with delete case, confirmation
    dialog integration, and automatic message list refresh
  apps/desktop/src/shared/ipc/messagesConstants.ts: Added DELETE channel constant for message deletion IPC operations
  apps/desktop/src/shared/ipc/messages/deleteRequest.ts: Created request type interface for message deletion with ID parameter
  apps/desktop/src/shared/ipc/messages/deleteResponse.ts: Created response type
    interface for message deletion with boolean success indicator
  apps/desktop/src/shared/ipc/messages/index.ts: Added exports for new delete request and response types
  apps/desktop/src/shared/ipc/index.ts: Added message delete types to main IPC types export
  apps/desktop/src/electron/preload.ts: Added delete method to messages API with
    proper error handling and IPC communication
  apps/desktop/src/types/electron.d.ts: Updated ElectronAPI interface to include
    delete method signature in messages interface
  apps/desktop/src/electron/messagesHandlers.ts: Added DELETE IPC handler using
    messagesRepository.delete with proper logging and error handling
log:
  - "Auto-completed: All child tasks are complete"
schema: v1.0
childrenIds:
  - T-create-clipboard-service-with
  - T-create-message-deletion
  - T-implement-copy-functionality
  - T-implement-delete-functionality
  - T-remove-regenerate-functionalit
created: 2025-08-31T19:23:41.799Z
updated: 2025-08-31T19:23:41.799Z
---

# Implement Message Context Menu Actions

## Purpose and Functionality

Implement the functional behavior for message context menu actions (copy and delete) while completely removing the regenerate functionality from the message interface. This feature will make the existing context menu UI fully operational by providing real implementations for copy and delete actions.

## Key Components to Implement

### 1. Message Copy Functionality

- Copy message content to system clipboard
- Handle different message types (user, agent, system)
- Provide user feedback for successful copy operations
- Handle copy failures gracefully with error messages

### 2. Message Delete Functionality

- Remove messages from conversation and database
- Update UI to reflect deleted messages immediately
- Handle delete operation errors with user feedback
- Confirm destructive delete actions with user dialog

### 3. Remove Regenerate Functionality

- Remove all regenerate-related code from MessageContextMenu component
- Remove regenerate handlers from MessageItem component
- Update MessageContextMenuProps to remove regenerate-related properties
- Update all references and usage sites

## Detailed Acceptance Criteria

### Copy Message Functionality

- **Functional Behavior**: When user clicks "Copy message" from context menu, the message content is copied to system clipboard
- **Input/Output**: Takes message content string, outputs to system clipboard via Clipboard API
- **Error Handling**: Display error message "Failed to copy message" if clipboard API fails
- **Content Formatting**: Copy plain text content without markdown formatting or special characters

### Delete Message Functionality

- **Functional Behavior**: When user clicks "Delete message", show confirmation dialog then permanently remove message
- **Confirmation Dialog**: "Are you sure you want to delete this message? This action cannot be undone."
- **Database Operations**: Remove message record from SQLite database via existing message services
- **UI Updates**: Remove message from conversation display immediately after confirmation
- **Data Validation**: Ensure message ID exists before attempting deletion

### Remove Regenerate Functionality

- **Component Updates**: Remove "Regenerate" menu item from MessageContextMenu component entirely
- **Props Interface**: Remove `onRegenerate` and `canRegenerate` properties from MessageContextMenuProps
- **Event Handling**: Remove regenerate case from onContextMenuAction handlers
- **Usage Updates**: Update all MessageItem usage sites to remove regenerate-related props
- **Type Safety**: Ensure TypeScript compilation succeeds after regenerate removal

### Browser/Platform Compatibility

- **Clipboard API**: Use modern Clipboard API with fallback for older browsers
- **Confirmation Dialogs**: Use native browser confirm() or custom modal dialog component
- **Touch Devices**: Ensure context menu actions work on touch devices

### Accessibility Requirements

- **Keyboard Navigation**: Copy and delete actions accessible via keyboard shortcuts
- **Screen Readers**: Proper ARIA labels for context menu actions
- **Focus Management**: Maintain focus appropriately after delete operations

## Implementation Guidance

### Technical Approach

1. **Service Layer**: Create `MessageActionsService` in shared package for copy/delete operations
2. **Platform Abstraction**: Use clipboard bridge pattern for cross-platform clipboard access
3. **State Management**: Update existing message stores to handle delete operations
4. **Database Integration**: Extend existing message database services for delete operations

### Architecture Patterns

- Follow existing platform abstraction pattern for clipboard operations
- Use dependency injection for message service integration
- Implement optimistic updates for better user experience
- Follow existing error handling

## Testing Requirements

### Unit Tests

- Test copy functionality with different message content types
- Test delete confirmation dialog display and handling
- Test error scenarios for failed copy/delete operations
- Test regenerate functionality removal doesn't break existing features

### Integration Tests

- Test copy operation integrates with system clipboard correctly
- Test delete operation removes message from database and UI
- Test context menu displays correct options (copy, delete only)

## Security Considerations

- **Input Validation**: Sanitize message content before clipboard operations
- **Authorization**: Ensure users can only delete their own messages (if applicable)
- **Data Protection**: Ensure deleted messages are permanently removed from storage

## Performance Requirements

- **Copy Operations**: Complete within 100ms for typical message sizes
- **Delete Operations**: Database deletion complete within 500ms
- **UI Response**: Context menu actions provide immediate visual feedback

## Dependencies

- Clipboard API or compatible clipboard library
- Existing message database services
- Confirmation dialog component or native browser dialogs

## Files Likely to be Modified

- `apps/desktop/src/components/chat/MessageContextMenu.tsx` - Remove regenerate menu item
- `apps/desktop/src/components/chat/MessageItem.tsx` - Remove regenerate handlers
- `packages/ui-shared/src/types/chat/MessageContextMenuProps.ts` - Remove regenerate props
- `apps/desktop/src/components/layout/MainContentPanelDisplay.tsx` - Implement real context menu actions
- `packages/shared/src/services/` - Add message actions service
- New clipboard bridge implementations for platform abstraction
