---
id: T-implement-usemessages-hook
title: Implement useMessages hook for fetching conversation messages
status: open
priority: high
parent: F-message-hooks-implementation
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-29T17:17:07.116Z
updated: 2025-08-29T17:17:07.116Z
---

# Implement useMessages Hook

## Context

Create the core message fetching hook that follows the exact pattern established in `apps/desktop/src/hooks/conversations/useConversations.ts`. This hook will provide the interface between UI components and IPC for message retrieval operations.

## Technical Requirements

### File Location

- Create `apps/desktop/src/hooks/messages/useMessages.ts`
- Follow exact pattern from `useConversations` hook

### Implementation Details

**Hook Signature:**

```typescript
export function useMessages(conversationId: string | null): UseMessagesResult;
```

**Return Interface:**

```typescript
interface UseMessagesResult {
  messages: Message[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isEmpty: boolean;
}
```

**Core Functionality:**

1. **Message Fetching**: Call `window.electronAPI.messages.list(conversationId)` via IPC
2. **Message Sorting**: Return messages sorted by `created_at ASC, id ASC` for stable chronological ordering
3. **Loading States**: Track loading, error, and success states
4. **Electron Environment Detection**: Handle non-Electron environments gracefully
5. **Auto-fetch**: Load messages on mount and when conversationId changes
6. **Manual Refetch**: Provide refetch function for real-time updates

### Pattern Consistency Requirements

**Follow useConversations patterns exactly:**

- Use `useServices()` for logger access
- Include comprehensive Electron environment detection (lines 73-83 pattern)
- Implement proper error handling with logger.error
- Use same state management patterns (useState, useCallback, useMemo)
- Include debug logging for successful operations
- Handle null conversationId by clearing messages array

### Integration Points

**Dependencies:**

- Import `Message` type from `@fishbowl-ai/shared`
- Use `useServices()` from `../../contexts`
- Call IPC bridge methods (will be implemented in separate task)

**IPC Interface:**

- `window.electronAPI.messages.list(conversationId: string): Promise<Message[]>`
- Handle environment where electronAPI is not available

## Acceptance Criteria

### Functional Requirements

- ✅ Accepts conversationId parameter (string | null)
- ✅ Returns UseMessagesResult interface with all required properties
- ✅ Fetches messages via `window.electronAPI.messages.list()`
- ✅ Sorts messages by `created_at ASC, id ASC` (chronological order)
- ✅ Handles null conversationId by returning empty array
- ✅ Provides loading state during async operations
- ✅ Includes error handling with user-friendly error state
- ✅ Auto-fetches messages on mount and conversationId changes
- ✅ Provides manual refetch function for real-time behavior

### Pattern Consistency Requirements

- ✅ Follows exact useConversations structure and naming
- ✅ Uses useServices() for logger access
- ✅ Includes comprehensive Electron environment detection
- ✅ Implements proper error handling with logging
- ✅ Uses same React optimization patterns (useCallback, useMemo)
- ✅ Includes debug logging for operations

### Error Handling Requirements

- ✅ Gracefully handles non-Electron environments
- ✅ Provides clear error messages for failures
- ✅ Logs errors with context information
- ✅ Maintains consistent error state management

### Unit Testing Requirements

- ✅ Create comprehensive unit tests in `__tests__/useMessages.test.tsx`
- ✅ Mock `window.electronAPI.messages.list` interface
- ✅ Test successful message loading and sorting
- ✅ Test loading states and error handling
- ✅ Test empty conversation handling
- ✅ Test refetch functionality
- ✅ Test Electron environment detection
- ✅ Verify proper cleanup and state transitions

## Out of Scope

- Message creation functionality (handled by useCreateMessage)
- Message updates functionality (handled by useUpdateMessage)
- IPC bridge implementation (separate task)
- Real-time message streaming (MVP uses refetch pattern)
