---
id: T-create-ipc-handlers-for
title: Create IPC handlers for conversation agent operations
status: open
priority: high
parent: F-service-layer-and-ipc
prerequisites:
  - T-create-conversationagentservic
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-25T04:36:40.219Z
updated: 2025-08-25T04:36:40.219Z
---

# Create IPC handlers for conversation agent operations

## Context

Implement Electron IPC handlers to expose conversation agent operations to the renderer process. Follow the exact patterns established by existing handlers like conversationsHandlers.ts.

## Technical Approach

Create handlers following the established IPC pattern with proper error serialization, logging, and type safety. All database operations must go through the main process for security.

## Implementation Requirements

### Handler File Structure

Create `apps/desktop/src/electron/conversationAgentHandlers.ts` following conversationsHandlers.ts pattern:

- Import required dependencies (ipcMain, logger, serializeError)
- Export `setupConversationAgentHandlers(mainServices: MainProcessServices)` function
- Include comprehensive logging for all operations
- Use structured error handling with serializeError utility

### IPC Channel Implementation

Implement these three IPC channels with full request/response typing:

1. **`conversationAgent:getByConversation`**
   - Request: `{ conversationId: string }`
   - Response: `{ success: boolean, data?: ConversationAgentViewModel[], error?: SerializedError }`
   - Calls service.getAgentsForConversation()
   - Logs request with conversationId and response with count

2. **`conversationAgent:add`**
   - Request: `{ conversationId: string, agentId: string }`
   - Response: `{ success: boolean, data?: ConversationAgentViewModel, error?: SerializedError }`
   - Calls service.addAgentToConversation()
   - Logs request with both IDs and success/failure

3. **`conversationAgent:remove`**
   - Request: `{ conversationId: string, agentId: string }`
   - Response: `{ success: boolean, data?: boolean, error?: SerializedError }`
   - Calls service.removeAgentFromConversation()
   - Logs request with both IDs and success/failure

### Error Handling Pattern

Follow the exact error handling pattern from conversationsHandlers.ts:

```typescript
try {
  // Handler logic
  logger.debug("Operation description", { relevant: "context" });
  const result = await service.method();
  logger.info("Operation succeeded", { result: "summary" });
  return { success: true, data: result };
} catch (error) {
  logger.error("Operation failed", error as Error);
  return { success: false, error: serializeError(error) };
}
```

### Type Definitions

Create request/response types in a new file `packages/shared/src/types/ipc/conversationAgentTypes.ts`:

- ConversationAgentGetByConversationRequest
- ConversationAgentGetByConversationResponse
- ConversationAgentAddRequest
- ConversationAgentAddResponse
- ConversationAgentRemoveRequest
- ConversationAgentRemoveResponse

Follow the exact typing pattern used in conversation IPC types.

### Channel Constants

Add channel constants to maintain consistency:

```typescript
export const CONVERSATION_AGENT_CHANNELS = {
  GET_BY_CONVERSATION: "conversationAgent:getByConversation",
  ADD: "conversationAgent:add",
  REMOVE: "conversationAgent:remove",
} as const;
```

### Handler Registration

The setupConversationAgentHandlers function should:

- Accept MainProcessServices parameter
- Access ConversationAgentService through mainServices
- Register all three ipcMain.handle calls
- Log "Conversation agent IPC handlers initialized" on completion
- Follow exact pattern from existing handlers

### Integration with MainProcessServices

The handlers will access the ConversationAgentService through MainProcessServices. The service instantiation will be handled in a separate task.

## Unit Tests

Create comprehensive test suite at `apps/desktop/src/electron/__tests__/conversationAgentHandlers.test.ts`:

- **Setup validation**: Verify all three handlers are registered with correct channels
- **getByConversation handler tests**:
  - Successfully returns agent list
  - Handles empty results
  - Handles service errors with proper error serialization
- **add handler tests**:
  - Successfully adds agent and returns populated data
  - Handles DuplicateAgentError correctly
  - Handles validation errors with proper serialization
- **remove handler tests**:
  - Successfully removes agent
  - Handles ConversationAgentNotFoundError
  - Handles validation errors
- **Error serialization tests**: Verify all error types are properly serialized for IPC transport
- **Logging verification**: Ensure proper logging for all operations

Follow the exact test structure from conversationsHandlers.test.ts.

## Dependencies

- ConversationAgentService (from previous task)
- MainProcessServices class
- IPC type definitions
- serializeError utility
- Existing logging infrastructure

## Acceptance Criteria

- [ ] Three IPC handlers implemented following exact existing patterns
- [ ] Proper request/response typing for all channels
- [ ] Comprehensive error handling with serializeError
- [ ] Structured logging for all operations (debug for requests, info for success, error for failures)
- [ ] Channel constants exported for consistency
- [ ] setupConversationAgentHandlers function exported
- [ ] Complete unit test suite covering all handlers and error conditions
- [ ] Integration with MainProcessServices parameter
- [ ] IPC type definitions created and exported

## File Structure

```
apps/desktop/src/electron/conversationAgentHandlers.ts
apps/desktop/src/electron/__tests__/conversationAgentHandlers.test.ts
packages/shared/src/types/ipc/conversationAgentTypes.ts
```

## Implementation Notes

- Must exactly follow the patterns from conversationsHandlers.ts
- All service access goes through mainServices parameter
- Error serialization is critical for IPC transport
- Channel naming must use 'conversationAgent:' prefix consistently
- The service instance will be made available through MainProcessServices in a separate task
