---
id: F-message-hooks-implementation
title: Message Hooks Implementation
status: done
priority: medium
parent: E-message-system-foundation
prerequisites:
  - F-messages-ipc-bridge
affectedFiles:
  apps/desktop/src/hooks/messages/useMessages.ts: Created new useMessages hook
    following useConversations pattern with conversationId parameter, message
    fetching via IPC, proper error handling, and stable chronological sorting
  apps/desktop/src/hooks/messages/index.ts: Created barrel export file for
    messages hooks with proper JSDoc documentation; Updated barrel export file
    to include useCreateMessage hook with documentation examples; Updated barrel
    export file to include useUpdateMessage hook with documentation examples
  apps/desktop/src/hooks/messages/__tests__/useMessages.test.tsx:
    Created comprehensive unit test suite with 18 test scenarios covering all
    hook functionality including success cases, error handling, environment
    detection, refetch operations, sorting behavior, and memory cleanup
  apps/desktop/src/hooks/messages/useCreateMessage.ts: Created new
    useCreateMessage hook with validation, error handling, and IPC integration
    following useCreateConversation pattern
  apps/desktop/src/hooks/messages/__tests__/useCreateMessage.test.tsx:
    Created comprehensive unit test suite with 23 test scenarios covering all
    hook functionality including success cases, validation errors, IPC errors,
    environment detection, and memory cleanup
  apps/desktop/src/hooks/messages/useUpdateMessage.ts: Created new
    useUpdateMessage hook with updateInclusion function, proper error handling,
    environment detection, and state management following established patterns
  apps/desktop/src/hooks/messages/__tests__/useUpdateMessage.test.tsx:
    Created comprehensive unit test suite with 22 test scenarios covering all
    hook functionality including success cases, validation errors, IPC errors,
    environment detection, and concurrent operations
log:
  - "Auto-completed: All child tasks are complete"
schema: v1.0
childrenIds:
  - T-implement-usecreatemessage
  - T-implement-usemessages-hook
  - T-implement-useupdatemessage
created: 2025-08-29T16:56:52.443Z
updated: 2025-08-29T16:56:52.443Z
---

# Message Hooks Implementation

## Purpose and Functionality

Implement the core React hooks for message management that follow the established patterns from `useConversations` and `useConversationAgents`. These hooks will provide the interface layer between the UI components and the IPC bridge for message operations.

## Key Components to Implement

### useMessages Hook (`apps/desktop/src/hooks/messages/useMessages.ts`)

- Fetch and display messages for a conversation with real-time updates
- Follow exact pattern from `useConversations` hook
- Return messages sorted by `created_at ASC, id ASC` for stable ordering
- Provide loading, error, and refetch states
- Handle empty conversations gracefully

### useCreateMessage Hook (`apps/desktop/src/hooks/messages/useCreateMessage.ts`)

- Send new messages (user or system) with proper error handling
- Accept `CreateMessageInput` with conversation_id, role, content
- Return sending state and error handling
- Trigger useMessages refresh for real-time UI updates

### useUpdateMessage Hook (`apps/desktop/src/hooks/messages/useUpdateMessage.ts`)

- Update message properties (inclusion flags, content)
- Support inclusion flag changes for context control
- Persist changes immediately to database

## Detailed Acceptance Criteria

### useMessages Hook Requirements

**GIVEN** a conversation ID
**WHEN** the hook is called
**THEN** it should:

- Fetch all messages for that conversation via `window.electronAPI.messages.list(conversationId)`
- Return messages sorted by `created_at ASC, id ASC` for stable ordering
- Provide `{ messages, isLoading, error, refetch, isEmpty }` interface matching `useConversations`
- Support real-time behavior via refetch-after-create/update
- Handle empty conversations gracefully with `isEmpty` computed property
- Include proper TypeScript typing for all return values
- Handle Electron environment detection with fallback
- Use `useServices()` for logging following established patterns

### useCreateMessage Hook Requirements

**GIVEN** message creation requests
**WHEN** creating user or system messages
**THEN** it should:

- Accept `CreateMessageInput` parameter with conversation_id, role, content
- Call `window.electronAPI.messages.create(input)` for persistence
- Return `{ createMessage, sending, error }` interface
- Set `sending: true` during message creation
- Clear error state on successful creation
- Trigger `useMessages` refresh for real-time UI updates
- Handle validation errors (empty content, invalid conversation)
- Provide clear error messages for user feedback
- Reset sending state after completion or failure

### useUpdateMessage Hook Requirements

**GIVEN** message modification needs
**WHEN** updating message properties
**THEN** it should:

- Support inclusion flag changes via `updateInclusion(id, included)`
- Call `window.electronAPI.messages.updateInclusion(id, included)`
- Return `{ updateMessage, updating, error }` interface
- Handle network/database errors gracefully
- Update local state immediately for responsive UI

## Implementation Guidance

### File Structure

```
apps/desktop/src/hooks/messages/
├── index.ts                 # Barrel exports
├── useMessages.ts          # Message fetching hook
├── useCreateMessage.ts     # Message creation hook
├── useUpdateMessage.ts     # Message update hook
└── __tests__/              # Unit tests for all hooks
    ├── useMessages.test.tsx
    ├── useCreateMessage.test.tsx
    └── useUpdateMessage.test.tsx
```

### Pattern Consistency

- Follow exact patterns from `apps/desktop/src/hooks/conversations/useConversations.ts`
- Use `useServices()` for logger access
- Include Electron environment detection
- Implement proper error handling and loading states
- Use `useCallback` and `useMemo` for performance optimization
- Follow established TypeScript interface naming (`UseMessagesResult`, etc.)

### Integration Points

- Hooks will call IPC methods that will be implemented in the IPC Bridge feature
- `CreateMessageInput` type should be imported from shared package
- Message sorting should prefer SQL ORDER BY but fallback to JavaScript sort
- Real-time updates via refetch mechanism (no global event bus in MVP)
- Preload is centralized in `apps/desktop/src/electron/preload.ts`; ensure `ElectronAPI` is extended in `apps/desktop/src/types/electron.d.ts`
- Follow refetch pattern used in `useConversationAgents` after create/update for real-time sync

## Testing Requirements

### Unit Test Coverage

- All hooks must have comprehensive unit tests following existing patterns
- Mock `window.electronAPI.messages` interface for testing
- Test loading states, error handling, and successful operations
- Test edge cases: empty conversations, network failures, invalid inputs
- Verify proper state transitions and cleanup
- Test refetch functionality and real-time behavior

### Test Scenarios

- **useMessages**: Empty results, successful load, error states, refetch
- **useCreateMessage**: Successful creation, validation errors, network failures
- **useUpdateMessage**: Successful updates

## Security Considerations

- All database operations must go through IPC bridge (no direct DB access)
- Input validation should occur before IPC calls
- Error messages should not expose internal system details
- Handle malformed responses from main process gracefully

## Dependencies

- Must wait for Messages IPC Bridge feature to provide the IPC interface
- Depends on existing `useServices()` hook and logging infrastructure
- Requires `CreateMessageInput` and `Message` types from shared package
- Integrates with existing Electron preload and main process architecture
