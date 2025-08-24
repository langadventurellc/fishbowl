---
id: T-implement-conversations-ipc
title: Implement conversations IPC handlers module
status: done
priority: high
parent: F-main-process-ipc-handlers
prerequisites:
  - T-create-conversations-ipc
affectedFiles:
  apps/desktop/src/electron/conversationsHandlers.ts: New file - Created
    conversations IPC handlers with CREATE, LIST, and GET operations following
    agentsHandlers pattern
  apps/desktop/src/electron/main.ts: Added import for setupConversationsHandlers
    and registered handlers in app initialization with proper error handling
log:
  - Successfully implemented conversations IPC handlers module following the
    established pattern from agentsHandlers.ts. Created
    setupConversationsHandlers function with CREATE, LIST, and GET handlers that
    bridge the renderer process with ConversationsRepository through proper
    error handling, logging, and validation. All handlers use proper TypeScript
    typing, error serialization, and debug/error logging. Integrated handlers
    into main.ts startup process. All quality checks pass.
schema: v1.0
childrenIds: []
created: 2025-08-24T00:04:01.425Z
updated: 2025-08-24T00:04:01.425Z
---

# Implement conversations IPC handlers module

## Context

Create the main process IPC handlers for conversation operations, following the established pattern from `agentsHandlers.ts`. These handlers bridge the renderer process with the ConversationsRepository.

**Reference Implementation**: Follow exact pattern from `apps/desktop/src/electron/agentsHandlers.ts`

## Implementation Requirements

### 1. Create Handler File

- Create `apps/desktop/src/electron/conversationsHandlers.ts`
- Import required dependencies following existing pattern
- Create logger instance using shared logger

### 2. Setup Function

- Export `setupConversationsHandlers(): void` function
- Register all IPC handlers using `ipcMain.handle()`
- Log successful initialization at end

### 3. Handler Implementations

#### Create Handler

- Channel: `CONVERSATION_CHANNELS.CREATE`
- Handler signature: `async (_event, request: ConversationsCreateRequest): Promise<ConversationsCreateResponse>`
- Get repository from `mainProcessServices.getConversationsRepository()`
- Call `repository.create(request)`
- Return success response with conversation data

#### List Handler

- Channel: `CONVERSATION_CHANNELS.LIST`
- Handler signature: `async (_event, request: ConversationsListRequest): Promise<ConversationsListResponse>`
- Call `repository.list()`
- Return success response with conversation array

#### Get Handler

- Channel: `CONVERSATION_CHANNELS.GET`
- Handler signature: `async (_event, request: ConversationsGetRequest): Promise<ConversationsGetResponse>`
- Validate UUID format for request.id
- Call `repository.get(request.id)`
- Return success response with conversation or null

### 4. Error Handling Pattern

```typescript
try {
  logger.debug("Creating conversation", { title: request.title });
  // ... handler logic
  logger.debug("Conversation created successfully", { id: result.id });
  return { success: true, data: result };
} catch (error) {
  logger.error("Failed to create conversation", error as Error);
  return { success: false, error: serializeError(error) };
}
```

### 5. Dependencies

- Import types from `../../shared/ipc/index`
- Import `serializeError` from existing utilities
- Import logger from `@fishbowl-ai/shared`
- Import mainProcessServices instance

## Detailed Acceptance Criteria

- [ ] File created at `apps/desktop/src/electron/conversationsHandlers.ts`
- [ ] setupConversationsHandlers function exports correctly
- [ ] Create handler implemented with full validation and logging
- [ ] List handler implemented with error handling
- [ ] Get handler implemented with UUID validation
- [ ] All handlers use proper TypeScript typing
- [ ] Error serialization using existing serializeError utility
- [ ] Debug logging for successful operations
- [ ] Error logging for failures with stack traces
- [ ] Info log when all handlers are initialized
- [ ] UUID validation for GET requests
- [ ] Repository accessed through MainProcessServices

## Dependencies

- Completed `T-create-conversations-ipc` for types
- ConversationsRepository from MainProcessServices
- Existing serializeError utility
- Logger from shared package
- ipcMain from electron

## Testing Requirements

- Unit tests covering:
  - Setup function registers all handlers correctly
  - Create handler with valid and invalid inputs
  - List handler success and error scenarios
  - Get handler with valid UUID, invalid UUID, not found
  - Error serialization and logging
  - Repository method calls with correct parameters

## Technical Notes

Follow exact patterns from agentsHandlers.ts:

- Same import structure and organization
- Identical error handling patterns
- Same logging levels and message formats
- Consistent function naming and exports
- Proper async/await usage throughout

## Security Considerations

- Validate all input parameters from renderer
- UUID format validation to prevent injection
- Sanitize error messages through serializeError
- Never expose file paths or system details
- Log security-relevant events appropriately

## Performance Requirements

- Handlers execute in < 50ms for simple operations
- No blocking synchronous operations
- Efficient parameter validation
- Proper async operation handling
