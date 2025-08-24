---
id: F-react-hooks-for-conversations
title: React Hooks for Conversations
status: open
priority: medium
parent: E-ipc-communication-layer
prerequisites:
  - F-preload-script-conversations
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
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
