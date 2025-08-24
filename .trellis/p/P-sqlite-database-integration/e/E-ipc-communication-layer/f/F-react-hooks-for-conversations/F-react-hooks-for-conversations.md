---
id: F-react-hooks-for-conversations
title: React Hooks for Conversations
status: done
priority: medium
parent: E-ipc-communication-layer
prerequisites:
  - F-preload-script-conversations
affectedFiles:
  apps/desktop/src/hooks/conversations/useConversations.ts:
    Created new React hook
    for managing conversations list with auto-loading, error handling, manual
    refresh, and conversation sorting by created_at descending
  apps/desktop/src/hooks/conversations/__tests__/useConversations.test.tsx:
    Created comprehensive unit test suite with 16 tests covering initialization,
    loading states, error handling, sorting, refetch functionality, and memory
    cleanup
  apps/desktop/src/hooks/conversations/useCreateConversation.ts:
    Created comprehensive React hook for conversation creation with loading
    states, error handling, reset functionality, and Electron environment
    validation. Includes full TypeScript interfaces and JSDoc documentation.
  apps/desktop/src/hooks/conversations/__tests__/useCreateConversation.test.tsx:
    Created extensive unit test suite with 14 test cases covering
    initialization, successful creation scenarios, error handling, environment
    validation, reset functionality, and memory cleanup patterns.
  apps/desktop/src/hooks/conversations/useConversation.ts:
    Created new React hook
    for fetching single conversation by ID with loading states, error handling,
    UUID validation, environment detection, and manual refetch functionality
  apps/desktop/src/hooks/conversations/__tests__/useConversation.test.tsx:
    Created comprehensive unit test suite with 22 tests covering initialization,
    fetch behavior, UUID validation, error handling, environment detection, ID
    changes, refetch functionality, loading state management, and memory cleanup
  apps/desktop/src/hooks/conversations/index.ts: Created new barrel export file
    for conversation hooks with JSDoc documentation, usage examples, and clean
    import interface for useConversations, useCreateConversation, and
    useConversation hooks
  apps/desktop/src/hooks/conversations/__tests__/index.test.ts:
    Created comprehensive unit test suite with 5 test cases verifying all hooks
    are properly exported, no unexpected exports exist, and imports work
    correctly without circular dependencies
log:
  - "Auto-completed: All child tasks are complete"
schema: v1.0
childrenIds:
  - T-create-conversations-hooks
  - T-implement-useconversation-hook
  - T-implement-useconversations
  - T-implement-usecreateconversatio
created: 2025-08-23T21:26:25.965Z
updated: 2025-08-23T21:26:25.965Z
---

# React Hooks for Conversations

## Purpose and Functionality

Create React hooks that provide a clean, reactive interface for conversation operations in the renderer process. These hooks manage loading states, error handling, and provide a familiar React API for components to interact with the conversation database.

## Key Components to Implement

### 1. Core Hooks

- `useCreateConversation` - Create new conversations with loading state
- `useConversations` - List conversations with automatic refresh
- `useConversation` - Get single conversation by ID
- `useDeleteConversation` - Delete with confirmation (future)
- `useUpdateConversation` - Update conversation details (future)

### 2. State Management

- Loading states for async operations
- Error state with retry capability
- Success callbacks for UI updates
- Optimistic updates where appropriate

### 3. Error Handling

- User-friendly error messages
- Retry logic for transient failures
- Error boundary integration
- Logging for debugging

## Detailed Acceptance Criteria

### Hook Implementations

- [ ] Create `apps/desktop/src/hooks/conversations/` directory
- [ ] Implement useCreateConversation hook
- [ ] Implement useConversations hook
- [ ] Implement useConversation hook
- [ ] Create barrel export file

### useCreateConversation Hook

- [ ] Accept optional title parameter
- [ ] Return { createConversation, isCreating, error }
- [ ] Handle success with callback option
- [ ] Reset error state on retry
- [ ] Loading state during creation

### useConversations Hook

- [ ] Return { conversations, isLoading, error, refetch }
- [ ] Auto-fetch on mount
- [ ] Manual refetch capability
- [ ] Sort by created_at descending
- [ ] Handle empty state

### useConversation Hook

- [ ] Accept conversation ID parameter
- [ ] Return { conversation, isLoading, error }
- [ ] Handle not found case
- [ ] Cache results appropriately
- [ ] Update when ID changes

### Error Handling

- [ ] Catch IPC errors
- [ ] Parse error messages for display
- [ ] Provide retry functions
- [ ] Log errors for debugging
- [ ] Clear errors on successful operations

## Technical Requirements

### Hook Pattern Example

```typescript
export function useCreateConversation() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createConversation = useCallback(async (title?: string) => {
    setIsCreating(true);
    setError(null);
    try {
      const conversation = await window.api.conversations.create(title);
      return conversation;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, []);

  return { createConversation, isCreating, error };
}
```

### TypeScript Requirements

- Full type safety for all hooks
- Proper error typing
- Generic types where appropriate
- Exported types for hook returns

## Dependencies

- React hooks (useState, useEffect, useCallback)
- Window.api.conversations from preload
- Conversation types from @fishbowl-ai/shared
- Logger for debugging

## Testing Requirements

- [ ] Unit tests for all hooks
- [ ] Mock window.api.conversations
- [ ] Test loading states
- [ ] Test error scenarios
- [ ] Test successful operations
- [ ] Test edge cases (empty lists, not found)

## Implementation Guidance

Follow React best practices:

1. Use proper dependency arrays
2. Cleanup effects properly
3. Memoize expensive operations
4. Handle component unmounting
5. Provide clear return types

Consider creating a base hook for common patterns (loading, error handling) that other hooks can build upon.

## Performance Requirements

- Minimize re-renders
- Efficient state updates
- Debounce rapid calls
- Cache results where appropriate
- Clean up resources on unmount

## Security Considerations

- Never store sensitive data in hook state
- Validate data from IPC responses
- Handle malformed responses gracefully
- Don't expose internal errors to UI

## Future Considerations

- Integration with global state management (if added)
- Optimistic updates for better UX
- Pagination for large conversation lists
- Real-time updates via IPC events
- Offline support with queue
