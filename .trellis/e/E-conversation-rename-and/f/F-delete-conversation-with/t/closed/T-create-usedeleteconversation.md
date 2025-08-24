---
id: T-create-usedeleteconversation
title: Create useDeleteConversation hook
status: open
priority: medium
parent: F-delete-conversation-with
prerequisites:
  - T-expose-delete-method-in
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-24T19:51:43.157Z
updated: 2025-08-24T19:51:43.157Z
---

# Create useDeleteConversation hook

## Context

Create a React hook for deleting conversations that follows the established pattern from useCreateConversation. This hook will manage loading states, error handling, and IPC communication for delete operations.

## Implementation Requirements

### File to create:

- `apps/desktop/src/hooks/conversations/useDeleteConversation.ts`

### Implementation pattern from useCreateConversation:

```typescript
export function useDeleteConversation(): UseDeleteConversationResult {
  const { logger } = useServices();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteConversation = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setIsDeleting(true);
        setError(null);

        // Check for Electron environment
        if (!window.electronAPI?.conversations?.delete) {
          throw new Error(
            "Delete conversation not available in this environment",
          );
        }

        // Call IPC to delete
        const success = await window.electronAPI.conversations.delete(id);

        logger.debug(`Deleted conversation: ${id}`);
        return success;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error("Failed to delete conversation:", error);
        setError(error);
        throw error;
      } finally {
        setIsDeleting(false);
      }
    },
    [logger],
  );

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return { deleteConversation, isDeleting, error, reset };
}
```

### Key features to implement:

1. Loading state management (isDeleting)
2. Error state management with reset function
3. Electron environment check
4. Proper error logging using logger service
5. TypeScript types for hook result

## Acceptance Criteria

- ✅ Hook follows useCreateConversation pattern exactly
- ✅ Manages isDeleting loading state correctly
- ✅ Handles errors and provides reset function
- ✅ Checks for Electron environment availability
- ✅ Logs success and errors appropriately
- ✅ Returns properly typed UseDeleteConversationResult
- ✅ Returns boolean success status
- ✅ Unit tests cover all states and edge cases

## Dependencies

- Task T-expose-delete-method-in must be completed
- useServices hook for logger access

## Testing Requirements

Write comprehensive unit tests that verify:

- Loading state changes during delete operation
- Error state management and reset functionality
- Electron environment check behavior
- Successful deletion returns true
- Failed deletion throws error
- Error handling and propagation
- Logger calls for success and error cases
