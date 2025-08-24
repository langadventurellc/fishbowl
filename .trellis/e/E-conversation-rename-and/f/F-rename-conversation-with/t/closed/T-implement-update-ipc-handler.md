---
id: T-implement-update-ipc-handler
title: Implement UPDATE IPC handler for conversations
status: done
priority: high
parent: F-rename-conversation-with
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
log:
  - Implemented UPDATE IPC handler for conversations in the main process. The
    handler follows existing patterns, registers for
    CONVERSATION_CHANNELS.UPDATE channel, calls ConversationsRepository.update()
    with proper parameters, returns updated conversation object on success, and
    handles errors with proper serialization. Added comprehensive unit tests
    covering successful updates, ConversationNotFoundError, and database errors.
    All tests pass and quality checks are clean.
schema: v1.0
childrenIds: []
created: 2025-08-24T19:49:28.277Z
updated: 2025-08-24T19:49:28.277Z
---

# Implement UPDATE IPC handler for conversations

## Context

Create the IPC handler for updating conversations in the main process. This handler will receive update requests from the renderer process and execute the database operation using the existing ConversationsRepository.update() method.

## Implementation Requirements

### File to modify:

- `apps/desktop/src/electron/conversationsHandlers.ts`

### Implementation steps:

1. Add UPDATE handler following the existing CREATE and LIST patterns
2. Extract conversation ID and update input from IPC event
3. Validate the conversation ID format (UUID validation)
4. Call `conversationsRepository.update(id, input)`
5. Return the updated conversation object on success
6. Handle and serialize errors appropriately

### Code pattern to follow:

```typescript
ipcMain.handle(
  CONVERSATION_CHANNELS.UPDATE,
  async (event, id: string, input: UpdateConversationInput) => {
    try {
      // Validate inputs
      // Call repository method
      // Return updated conversation
    } catch (error) {
      // Handle errors using existing error serialization pattern
    }
  },
);
```

## Acceptance Criteria

- ✅ Handler registered for CONVERSATION_CHANNELS.UPDATE channel
- ✅ Validates conversation ID is a valid UUID format
- ✅ Calls ConversationsRepository.update() with proper parameters
- ✅ Returns updated conversation object on success
- ✅ Properly serializes errors for IPC transmission
- ✅ Follows existing logging patterns (logger.info on success, logger.error on failure)
- ✅ Unit tests verify handler behavior with valid and invalid inputs

## Dependencies

- `CONVERSATION_CHANNELS.UPDATE` constant (already defined)
- `ConversationsRepository.update()` method (already implemented)
- `UpdateConversationInput` type from shared package

## Testing Requirements

Write unit tests that verify:

- Handler calls repository with correct parameters
- Successful update returns conversation object
- Invalid ID format returns appropriate error
- Repository errors are properly caught and serialized
- Logging occurs at appropriate points
