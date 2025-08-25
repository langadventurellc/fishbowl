---
id: T-implement-conversationagent
title: Implement conversationAgent IPC handlers
status: open
priority: high
parent: F-service-layer-and-ipc
prerequisites:
  - T-create-conversationagentservic
  - T-define-ipc-constants-and
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-25T05:18:13.174Z
updated: 2025-08-25T05:18:13.174Z
---

# Implement conversationAgent IPC handlers

## Context

Implement the IPC handlers for conversationAgent operations following the established pattern used by conversationsHandlers.ts. These handlers bridge the Electron renderer process and the main process, providing secure database access.

## Reference Implementation Patterns

- **Handler Structure**: Follow `conversationsHandlers.ts` setup function pattern
- **Error Handling**: Use `serializeError()` for consistent error transport
- **Logging**: Use structured logging for debugging and monitoring
- **Service Integration**: Inject ConversationAgentService via MainProcessServices

## Technical Approach

Create IPC handlers file following the established naming and organization patterns, with proper integration into the main process initialization.

## Implementation Requirements

### 1. IPC Handlers Implementation

**File**: `apps/desktop/src/electron/conversationAgentHandlers.ts`

```typescript
import { ipcMain } from "electron";
import { createLoggerSync } from "@fishbowl-ai/shared";
import {
  CONVERSATION_AGENT_CHANNELS,
  type ConversationAgentGetByConversationRequest,
  type ConversationAgentGetByConversationResponse,
  type ConversationAgentAddRequest,
  type ConversationAgentAddResponse,
  type ConversationAgentRemoveRequest,
  type ConversationAgentRemoveResponse,
} from "../shared/ipc";
import { serializeError } from "../shared/utils/errorSerialization";
import type { MainProcessServices } from "../main/services/MainProcessServices";

const logger = createLoggerSync({
  context: { metadata: { component: "ConversationAgentHandlers" } },
});

/**
 * Setup IPC handlers for conversation agent operations.
 *
 * Provides secure bridge between renderer process and conversation agent service.
 * All database operations are performed in the main process for security.
 *
 * @param mainServices - Main process services with conversation agent service
 */
export function setupConversationAgentHandlers(
  mainServices: MainProcessServices,
): void {
  // Handler implementation...
}
```

### 2. Handler Method Implementations

**getByConversation Handler**:

```typescript
ipcMain.handle(
  CONVERSATION_AGENT_CHANNELS.GET_BY_CONVERSATION,
  async (
    _event,
    request: ConversationAgentGetByConversationRequest,
  ): Promise<ConversationAgentGetByConversationResponse> => {
    logger.debug("Getting agents for conversation", {
      conversationId: request.conversationId,
    });
    try {
      const agents =
        await mainServices.conversationAgentService.getAgentsForConversation(
          request.conversationId,
        );
      logger.debug("Agents retrieved successfully", {
        conversationId: request.conversationId,
        count: agents.length,
      });
      return { success: true, data: agents };
    } catch (error) {
      logger.error("Failed to get conversation agents", error as Error);
      return { success: false, error: serializeError(error) };
    }
  },
);
```

**add Handler**:

```typescript
ipcMain.handle(
  CONVERSATION_AGENT_CHANNELS.ADD,
  async (
    _event,
    request: ConversationAgentAddRequest,
  ): Promise<ConversationAgentAddResponse> => {
    logger.debug("Adding agent to conversation", {
      conversationId: request.conversationId,
      agentId: request.agentId,
    });
    try {
      const conversationAgent =
        await mainServices.conversationAgentService.addAgentToConversation({
          conversationId: request.conversationId,
          agentId: request.agentId,
          displayOrder: request.displayOrder,
        });
      logger.info("Agent added to conversation successfully", {
        conversationId: request.conversationId,
        agentId: request.agentId,
        id: conversationAgent.id,
      });
      return { success: true, data: conversationAgent };
    } catch (error) {
      logger.error("Failed to add agent to conversation", error as Error);
      return { success: false, error: serializeError(error) };
    }
  },
);
```

**remove Handler**:

```typescript
ipcMain.handle(
  CONVERSATION_AGENT_CHANNELS.REMOVE,
  async (
    _event,
    request: ConversationAgentRemoveRequest,
  ): Promise<ConversationAgentRemoveResponse> => {
    logger.debug("Removing agent from conversation", {
      conversationId: request.conversationId,
      agentId: request.agentId,
    });
    try {
      await mainServices.conversationAgentService.removeAgentFromConversation({
        conversationId: request.conversationId,
        agentId: request.agentId,
      });
      logger.info("Agent removed from conversation successfully", {
        conversationId: request.conversationId,
        agentId: request.agentId,
      });
      return { success: true, data: true };
    } catch (error) {
      logger.error("Failed to remove agent from conversation", error as Error);
      return { success: false, error: serializeError(error) };
    }
  },
);
```

### 3. Handler Registration and Logging

**Complete Setup Function**:

- Initialize all three handlers following established patterns
- Add comprehensive logging for handler registration
- Include error context in all error logs
- Follow consistent success/error response patterns

**Final Handler Initialization**:

```typescript
logger.info("Conversation agent IPC handlers initialized");
```

### 4. Integration with Main Process

**Import in Main Process**: The handlers setup function will be called during main process initialization (this will be handled in the service registration task).

### Error Handling Requirements

**Error Serialization**:

- Use existing `serializeError()` utility for consistent error transport
- Preserve error types and messages from ConversationAgentService
- Include proper error context for debugging

**Request Validation**:

- Validate required fields exist in request objects
- Handle malformed requests gracefully with appropriate error responses
- Log validation failures for debugging

**Service Integration Error Handling**:

- Handle cases where conversationAgentService is not available
- Provide meaningful error messages for service failures
- Include request context in all error logs

### Testing Requirements

**Unit Tests in same task**:

**File**: `apps/desktop/src/electron/__tests__/conversationAgentHandlers.test.ts`

```typescript
import { ipcMain } from "electron";
import { setupConversationAgentHandlers } from "../conversationAgentHandlers";
import { CONVERSATION_AGENT_CHANNELS } from "../../shared/ipc";
import type { MainProcessServices } from "../../main/services/MainProcessServices";

// Mock implementations and test setup
describe("ConversationAgent IPC Handlers", () => {
  test("should setup all required handlers", () => {
    // Test handler registration
  });

  test("getByConversation handler should return agents", async () => {
    // Test successful agent retrieval
  });

  test("getByConversation handler should handle errors", async () => {
    // Test error handling
  });

  test("add handler should add agent to conversation", async () => {
    // Test successful agent addition
  });

  test("add handler should handle validation errors", async () => {
    // Test validation error handling
  });

  test("remove handler should remove agent from conversation", async () => {
    // Test successful agent removal
  });

  test("remove handler should handle not found errors", async () => {
    // Test not found error handling
  });
});
```

**Test Coverage**:

- Handler registration verification
- Successful operation responses
- Error handling and serialization
- Request validation
- Service integration error scenarios
- Logging verification

## Dependencies

- ConversationAgentService (T-create-conversationagentservic)
- IPC constants and types (T-define-ipc-constants-and)
- MainProcessServices integration (will be covered in registration task)
- Existing error serialization utilities
- Structured logging utilities

## Acceptance Criteria

- [ ] setupConversationAgentHandlers function implemented following established patterns
- [ ] getByConversation handler returns populated ConversationAgentViewModel array
- [ ] add handler validates and creates conversation agent associations
- [ ] remove handler deletes conversation agent associations by conversationId/agentId
- [ ] All handlers use consistent error handling with serializeError()
- [ ] Comprehensive structured logging for all operations and errors
- [ ] Request validation with proper error responses
- [ ] Unit tests covering all handlers and error scenarios
- [ ] Test coverage for success and failure paths
- [ ] Handler registration logging and verification

## Implementation Notes

- These handlers provide the secure bridge between renderer and main process
- All database operations are performed through ConversationAgentService
- Error handling preserves business logic errors for proper UI feedback
- The setup function will be called during main process initialization
- Handlers must be performant as they're called frequently during UI updates
