---
id: T-implement-delete-ipc-handler
title: Implement DELETE IPC handler for conversations
status: open
priority: high
parent: F-delete-conversation-with
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-24T19:50:54.578Z
updated: 2025-08-24T19:50:54.578Z
---

# Implement DELETE IPC handler for conversations

## Context

Create the IPC handler for deleting conversations in the main process. This handler will receive delete requests from the renderer process and execute the database operation using the existing ConversationsRepository.delete() method.

## Implementation Requirements

### File to modify:

- `apps/desktop/src/electron/conversationsHandlers.ts`

### Implementation steps:

1. Add DELETE handler following the existing CREATE and LIST patterns
2. Extract conversation ID from IPC event
3. Validate the conversation ID format (UUID validation)
4. Call `conversationsRepository.delete(id)`
5. Return success boolean on completion
6. Handle and serialize errors appropriately

### Code pattern to follow:

```typescript
ipcMain.handle(CONVERSATION_CHANNELS.DELETE, async (event, id: string) => {
  try {
    // Validate ID format
    // Call repository.delete(id)
    // Return true on success
  } catch (error) {
    // Handle errors using existing error serialization pattern
  }
});
```

## Acceptance Criteria

- ✅ Handler registered for CONVERSATION_CHANNELS.DELETE channel
- ✅ Validates conversation ID is a valid UUID format
- ✅ Calls ConversationsRepository.delete() with ID parameter
- ✅ Returns true on successful deletion
- ✅ Properly serializes errors for IPC transmission
- ✅ Follows existing logging patterns (logger.info on success, logger.error on failure)
- ✅ Unit tests verify handler behavior with valid and invalid inputs

## Dependencies

- `CONVERSATION_CHANNELS.DELETE` constant (already defined)
- `ConversationsRepository.delete()` method (already implemented)

## Testing Requirements

Write unit tests that verify:

- Handler calls repository.delete with correct ID
- Successful deletion returns true
- Invalid ID format returns appropriate error
- Repository errors are properly caught and serialized
- Non-existent conversation ID handled correctly
- Logging occurs at appropriate points
