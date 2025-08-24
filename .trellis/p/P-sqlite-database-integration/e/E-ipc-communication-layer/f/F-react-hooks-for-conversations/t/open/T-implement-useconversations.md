---
id: T-implement-useconversations
title: Implement useConversations hook
status: open
priority: high
parent: F-react-hooks-for-conversations
prerequisites:
  - T-add-conversations-api-to
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-24T00:06:05.633Z
updated: 2025-08-24T00:06:05.633Z
---

# Implement useConversations hook

## Context

Create a React hook for listing conversations with automatic loading, error handling, and manual refresh capability. This provides the foundation for displaying conversation lists in the UI.

**Directory**: `apps/desktop/src/hooks/conversations/`

## Implementation Requirements

### 1. Create Hook File

- Create `apps/desktop/src/hooks/conversations/useConversations.ts`
- Follow established React hook patterns

### 2. Hook Interface

```typescript
interface UseConversationsResult {
  conversations: Conversation[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isEmpty: boolean;
}

export function useConversations(): UseConversationsResult {
  // State management
  // Effect for auto-loading
  // Manual refetch function
  // Return hook interface
}
```

### 3. State Management

- `conversations`: Array of Conversation objects
- `isLoading`: Boolean for loading states
- `error`: Error state for error handling
- `isEmpty`: Computed property for empty state

### 4. Auto-Loading Logic

- Use useEffect to fetch conversations on mount
- Set loading state during initial fetch
- Handle errors and update error state
- Sort conversations by created_at descending

### 5. Manual Refresh

- `refetch`: Function to manually reload conversations
- Clear error state before refetch
- Update loading state during refetch
- Maintain sort order after refresh

### 6. Error Handling

- Catch and store IPC errors
- Provide clear error state for UI
- Reset error on successful operations
- Log errors for debugging

## Detailed Acceptance Criteria

- [ ] Hook file created with proper TypeScript interfaces
- [ ] conversations state initialized as empty array
- [ ] Auto-fetch on mount using useEffect
- [ ] isLoading state managed correctly
- [ ] Error handling with state management
- [ ] refetch function for manual refresh
- [ ] isEmpty computed from conversations length
- [ ] Conversations sorted by created_at descending
- [ ] Proper cleanup in useEffect
- [ ] No infinite re-render loops
- [ ] TypeScript strict typing throughout

## Dependencies

- React hooks (useState, useEffect, useCallback, useMemo)
- window.api.conversations.list from preload
- Conversation type from @fishbowl-ai/shared
- Logger for debugging (optional)

## Testing Requirements

- Unit tests covering:
  - Initial state and loading behavior
  - Successful conversation loading
  - Error handling during load
  - Manual refetch functionality
  - Empty state handling
  - Conversation sorting order
  - Effect cleanup on unmount
  - No memory leaks

## Technical Notes

Use React best practices:

- Proper dependency arrays in useEffect
- useCallback for refetch function
- useMemo for computed properties like isEmpty
- Cleanup effects to prevent memory leaks
- Efficient state updates to minimize re-renders

## Security Considerations

- Validate conversation data from IPC responses
- Handle malformed or unexpected response data
- Don't store sensitive conversation content in state
- Sanitize error messages for display

## Performance Requirements

- Initial load completes in < 2 seconds
- Efficient array sorting (consider memoization)
- Minimal re-renders on state changes
- Proper effect dependencies to prevent unnecessary calls
