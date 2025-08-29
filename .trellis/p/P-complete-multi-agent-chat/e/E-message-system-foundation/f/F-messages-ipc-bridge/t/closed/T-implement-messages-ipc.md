---
id: T-implement-messages-ipc
title: Implement messages IPC handlers in main process
status: done
priority: high
parent: F-messages-ipc-bridge
prerequisites:
  - T-create-messages-ipc-channel
affectedFiles:
  apps/desktop/src/main/services/MainProcessServices.ts: Added MessageRepository import and initialization with proper error handling
  apps/desktop/src/electron/messagesHandlers.ts: Created new file with
    setupMessagesHandlers function implementing messages:list, messages:create,
    and messages:updateInclusion handlers
  apps/desktop/src/electron/main.ts: Added import for setupMessagesHandlers and
    created setupMessagesIpcHandlers function following established patterns
log:
  - Implemented messages IPC handlers in main process with all three required
    operations following established patterns from conversationsHandlers.ts.
    Added MessageRepository to MainProcessServices and registered handlers in
    main.ts with proper error handling and logging. All quality checks pass.
schema: v1.0
childrenIds: []
created: 2025-08-29T17:43:23.862Z
updated: 2025-08-29T17:43:23.862Z
---

# Implement Messages IPC Handlers in Main Process

## Context and Background

Implement the main process IPC handlers that provide secure communication between renderer and main process for message operations. This creates the critical security boundary ensuring renderer cannot directly access the database.

### Related Issues

- **Parent Feature**: F-messages-ipc-bridge (Messages IPC Bridge)
- **Epic**: E-message-system-foundation (Message System Foundation)
- **Project**: P-complete-multi-agent-chat (Complete Multi-Agent Chat)
- **Prerequisites**: T-create-messages-ipc-channel (IPC type definitions must exist)

### Reference Patterns

Follow exact patterns from:

- `apps/desktop/src/electron/conversationsHandlers.ts` - Handler structure and error handling
- `apps/desktop/src/electron/main.ts` - Handler registration pattern
- `apps/desktop/src/main/services/MainProcessServices.ts` - Service integration

## Detailed Implementation Requirements

### 1. Create Messages Handlers File

**File**: `apps/desktop/src/electron/messagesHandlers.ts`

```typescript
import { ipcMain } from "electron";
import { logger } from "@fishbowl-ai/shared";
import { serializeError } from "@fishbowl-ai/shared";
import { MainProcessServices } from "../main/services/MainProcessServices.js";
import {
  MESSAGES_CHANNELS,
  MessagesListRequest,
  MessagesListResponse,
  MessagesCreateRequest,
  MessagesCreateResponse,
  MessagesUpdateInclusionRequest,
  MessagesUpdateInclusionResponse,
} from "../shared/ipc/index.js";

const logger = createLogger({
  context: { metadata: { component: "messagesHandlers" } },
});

export function setupMessagesHandlers(mainServices: MainProcessServices): void {
  // Implement three handlers following exact pattern from conversationsHandlers
}
```

### 2. Implement messages.list Handler

**Handler**: `messages:list`

- **Purpose**: Retrieve all messages for a conversation
- **Input**: `MessagesListRequest` with conversationId
- **Output**: `MessagesListResponse` with Message array
- **Repository Method**: `mainServices.messagesRepository.getByConversation(conversationId)`

**Implementation Requirements**:

```typescript
ipcMain.handle(
  MESSAGES_CHANNELS.LIST,
  async (
    _event,
    request: MessagesListRequest,
  ): Promise<MessagesListResponse> => {
    logger.debug("Listing messages for conversation", {
      conversationId: request.conversationId,
    });
    try {
      const messages = await mainServices.messagesRepository.getByConversation(
        request.conversationId,
      );
      logger.debug("Messages listed successfully", {
        count: messages.length,
        conversationId: request.conversationId,
      });
      return { success: true, data: messages };
    } catch (error) {
      logger.error("Failed to list messages", error as Error);
      return { success: false, error: serializeError(error) };
    }
  },
);
```

### 3. Implement messages.create Handler

**Handler**: `messages:create`

- **Purpose**: Create new user or system messages
- **Input**: `MessagesCreateRequest` with CreateMessageInput
- **Output**: `MessagesCreateResponse` with created Message
- **Repository Method**: `mainServices.messagesRepository.create(request.input)`

**Validation Requirements**:

- Validate required fields (conversation_id, role, content)
- Handle empty content validation
- Verify conversation_id references exist (repository handles this)
- Include proper error context in logging

### 4. Implement messages.updateInclusion Handler

**Handler**: `messages:updateInclusion`

- **Purpose**: Update message inclusion flags for context control
- **Input**: `MessagesUpdateInclusionRequest` with id and included boolean
- **Output**: `MessagesUpdateInclusionResponse` with updated Message
- **Repository Method**: `mainServices.messagesRepository.updateInclusion(request.id, request.included)`

**Error Handling Requirements**:

- Handle invalid message ID with clear error message
- Validate message exists before update attempt (repository handles this)
- Include message ID context in all log entries

### 5. Handler Registration and Service Integration

**Main Process Registration** (`apps/desktop/src/electron/main.ts`):

```typescript
// Add import
import { setupMessagesHandlers } from "./messagesHandlers.js";

// Add handler setup alongside existing ones
setupMessagesHandlers(services);
```

**Service Integration** (`apps/desktop/src/main/services/MainProcessServices.ts`):
Ensure messagesRepository is available in MainProcessServices. If not already present, add:

```typescript
import { MessageRepository } from "@fishbowl-ai/shared";

export class MainProcessServices {
  readonly messagesRepository: MessageRepository;

  constructor() {
    // Initialize messagesRepository with required dependencies
    this.messagesRepository = new MessageRepository(
      this.databaseBridge,
      this.cryptoUtils,
    );
  }
}
```

## Technical Requirements

### Error Handling Strategy

- Follow exact patterns from `conversationsHandlers.ts`
- Use `serializeError()` for consistent error formatting
- Provide specific error messages for validation failures
- Log detailed errors server-side with proper context
- Return user-friendly error messages in response
- Handle database errors gracefully without exposing internals

### Logging Requirements

- Use structured logging with consistent metadata
- Include operation context (conversationId, messageId, etc.)
- Debug level for normal operations, error level for failures
- Info level for successful operations that modify data
- Follow exact logging patterns from existing handlers

### Security Considerations

- Validate all inputs to prevent injection attacks
- Sanitize error messages to avoid exposing internal details
- Use proper IPC channels following existing security patterns
- Handle malformed requests gracefully without crashes
- Log security violations for monitoring
- Never expose database connection details in errors

## Acceptance Criteria

### Handler Implementation

- [x] `setupMessagesHandlers()` function exports and registers all three handlers
- [x] `messages:list` handler returns sorted messages for conversation
- [x] `messages:create` handler creates messages with proper validation
- [x] `messages:updateInclusion` handler updates message inclusion flags
- [x] All handlers follow exact error handling patterns from conversationsHandlers

### Error Handling

- [x] All handlers use try/catch with serializeError()
- [x] Specific error messages for validation failures
- [x] Proper logging with structured metadata
- [x] User-friendly error responses without internal details
- [x] Graceful handling of database errors

### Integration

- [x] Handler registration added to main.ts
- [x] MessageRepository available in MainProcessServices
- [x] All imports resolve correctly
- [x] TypeScript compilation without errors
- [x] Follows established IPC security patterns

## Testing Requirements

### Unit Tests

Create `apps/desktop/src/electron/__tests__/messagesHandlers.test.ts`:

- Test all three handlers with mock MessageRepository
- Test success scenarios for each operation
- Test error scenarios: invalid inputs, database failures
- Test proper error serialization and logging
- Test input validation edge cases

### Integration Tests

- Test handlers with real MessageRepository and test database
- Verify proper conversation message retrieval and sorting
- Test message creation with all required fields
- Test inclusion flag updates work correctly
- Test concurrent request handling

### Security Tests

- Test malformed inputs don't cause crashes
- Verify error messages don't expose internal details
- Test input validation prevents injection attempts
- Verify proper authorization and access controls

## Dependencies

- **Prerequisites**: T-create-messages-ipc-channel (IPC types must exist)
- **Repository**: Existing MessageRepository from @fishbowl-ai/shared
- **Services**: MainProcessServices must have messagesRepository instance
- **Patterns**: Established IPC handler and error handling patterns

## Out of Scope

- No preload interface implementation (separate task)
- No renderer-side hooks or UI integration (separate tasks)
- No caching or performance optimizations (use repository as-is)
- No streaming or real-time updates (separate concerns)
- No batch operations or transaction support (single operations only)
