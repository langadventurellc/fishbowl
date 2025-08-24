---
id: T-create-useupdateconversation
title: Create useUpdateConversation hook
status: open
priority: medium
parent: F-rename-conversation-with
prerequisites:
  - T-expose-update-method-in
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-24T19:50:01.033Z
updated: 2025-08-24T19:50:01.033Z
---

# Create useUpdateConversation hook

## Context

Create a React hook for updating conversations that follows the established pattern from useCreateConversation. This hook will manage loading states, error handling, and IPC communication for rename operations.

## Implementation Requirements

### File to create:

- `apps/desktop/src/hooks/conversations/useUpdateConversation.ts`

### Implementation pattern from useCreateConversation:

```typescript
export function useUpdateConversation(): UseUpdateConversationResult {
  const { logger } = useServices();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateConversation = useCallback(
    async (id: string, title: string): Promise<Conversation> => {
      // Set loading state
      // Clear previous errors
      // Check for Electron environment
      // Call electronAPI.conversations.update
      // Handle success/error
      // Return updated conversation
    },
    [logger],
  );

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return { updateConversation, isUpdating, error, reset };
}
```

### Key features to implement:

1. Loading state management (isUpdating)
2. Error state management with reset function
3. Electron environment check
4. Input validation (trim whitespace, check empty)
5. Proper error logging using logger service
6. TypeScript types for hook result

## Acceptance Criteria

- ✅ Hook follows useCreateConversation pattern exactly
- ✅ Manages isUpdating loading state correctly
- ✅ Handles errors and provides reset function
- ✅ Validates title input (not empty, trimmed)
- ✅ Checks for Electron environment availability
- ✅ Logs success and errors appropriately
- ✅ Returns properly typed UseUpdateConversationResult
- ✅ Unit tests cover all states and edge cases

## Dependencies

- Task T-expose-update-method-in must be completed
- useServices hook for logger access
- UpdateConversationInput type from shared package

## Testing Requirements

Write comprehensive unit tests that verify:

- Loading state changes during update operation
- Error state management and reset functionality
- Title validation (empty, whitespace-only)
- Electron environment check behavior
- Successful update flow returns conversation
- Error handling and propagation
- Logger calls for success and error cases
