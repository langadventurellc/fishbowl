---
id: T-implement-conversation-agent
title: Implement conversation agent IPC handlers
status: open
priority: high
parent: F-ipc-integration-for
prerequisites:
  - T-create-ipc-requestresponse
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-25T06:05:55.317Z
updated: 2025-08-25T06:05:55.317Z
---

# Implement Conversation Agent IPC Handlers

## Context

Create the main process IPC handlers that will receive requests from the renderer process and execute conversation agent operations through the repository. This follows the exact pattern from `conversationsHandlers.ts`.

## Implementation Requirements

### Create Handler File (`apps/desktop/src/electron/conversationAgentHandlers.ts`)

#### File Structure and Imports

```typescript
import { ipcMain } from "electron";
import { createLoggerSync } from "@fishbowl-ai/shared";
import { serializeError } from "../shared/ipc";
import type { MainProcessServices } from "../main/services/MainProcessServices";
import {
  CONVERSATION_AGENT_CHANNELS,
  ConversationAgentGetByConversationRequest,
  ConversationAgentGetByConversationResponse,
  ConversationAgentAddRequest,
  ConversationAgentAddResponse,
  ConversationAgentRemoveRequest,
  ConversationAgentRemoveResponse,
  ConversationAgentListRequest,
  ConversationAgentListResponse,
} from "../shared/ipc";

const logger = createLoggerSync({
  context: { metadata: { component: "ConversationAgentHandlers" } },
});
```

#### Handler Implementation

Create `setupConversationAgentHandlers` function following `conversationsHandlers.ts` pattern:

1. **GET_BY_CONVERSATION Handler**:
   - Call `mainServices.conversationAgentsRepository.findByConversationId()`
   - Return agents array or empty array if none found
   - Handle ConversationAgentNotFoundError gracefully

2. **ADD Handler**:
   - Call `mainServices.conversationAgentsRepository.create()`
   - Return created conversation agent
   - Handle DuplicateAgentError and validation errors

3. **REMOVE Handler**:
   - Call `mainServices.conversationAgentsRepository.delete()`
   - Return boolean success indicator
   - Handle ConversationAgentNotFoundError

4. **LIST Handler** (for debugging):
   - Call repository method to list all conversation agents
   - Return complete list with logging

### Error Handling Pattern

Follow exact pattern from `conversationsHandlers.ts`:

```typescript
try {
  // Repository operation
  logger.debug("Operation description", { relevant: "context" });
  const result = await mainServices.conversationAgentsRepository.method();
  logger.debug("Operation succeeded", { id: "relevant-id" });
  return { success: true, data: result };
} catch (error) {
  logger.error("Operation failed", error as Error);
  return { success: false, error: serializeError(error) };
}
```

### Logging Requirements

- Debug level: Log operation start with relevant context
- Debug/Info level: Log successful operations with result metadata
- Error level: Log failures with full error details
- Info level: Log handler initialization completion

## Technical Requirements

### Handler Registration

- Use `ipcMain.handle()` for all channels
- Register handlers in main process during app initialization
- Export single setup function for clean integration

### Repository Integration

- Access repository via `mainServices.conversationAgentsRepository`
- Call appropriate repository methods for each operation
- Transform repository results to IPC response format

### Type Safety

- Properly type all request/response objects
- Use exact types from IPC type definitions
- Ensure TypeScript compilation without errors

## Acceptance Criteria

- ✅ Handler file created following conversationsHandlers.ts structure
- ✅ All four IPC channels implemented (GET_BY_CONVERSATION, ADD, REMOVE, LIST)
- ✅ Error handling follows established patterns exactly
- ✅ Logging implemented at appropriate levels with meaningful context
- ✅ Repository methods called correctly with proper parameters
- ✅ Response format matches IPC response types
- ✅ TypeScript compilation succeeds without errors
- ✅ Setup function exported for main process registration

## Testing Requirements

### Unit Tests

Create `apps/desktop/src/electron/__tests__/conversationAgentHandlers.test.ts`:

- Test each handler with valid inputs
- Test error scenarios (invalid IDs, duplicate agents, etc.)
- Verify repository method calls with correct parameters
- Test response format and error serialization
- Mock repository and verify logging calls

### Integration Tests

- Handlers properly registered and responsive to IPC calls
- Repository operations execute successfully through handlers
- Error scenarios handled gracefully without crashing

## Implementation Notes

### Reference File

- **Primary Pattern**: `apps/desktop/src/electron/conversationsHandlers.ts`
- **Follow exactly**: Handler structure, error handling, logging patterns
- **Repository Methods**: Use `findByConversationId`, `create`, `delete` methods

### Repository Method Mapping

- `GET_BY_CONVERSATION` → `findByConversationId(conversationId)`
- `ADD` → `create(addAgentInput)`
- `REMOVE` → `delete(conversationAgentId)` or create specific removal method
- `LIST` → List all agents (for debugging)

### Dependencies

- MainProcessServices with integrated ConversationAgentsRepository
- IPC type definitions (channels, requests, responses)
- Shared logging and error serialization utilities
- Electron ipcMain for handler registration

### Handler Function Pattern

```typescript
export function setupConversationAgentHandlers(
  mainServices: MainProcessServices,
): void {
  // Handler implementations...

  logger.info("Conversation agent IPC handlers initialized");
}
```
