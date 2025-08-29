---
id: T-implement-main-process-chat
title: Implement main process chat IPC handlers
status: done
priority: high
parent: F-ipc-chat-bridge
prerequisites:
  - T-create-ipc-constants-for-chat
affectedFiles:
  apps/desktop/src/electron/chatHandlers.ts:
    Created main process IPC handlers for
    chat operations with sendToAgents method, event emission system, input
    validation, error handling, and ChatOrchestrationService integration
  apps/desktop/src/electron/__tests__/chatHandlers.test.ts:
    Created comprehensive
    unit test suite with 13 test cases covering handler registration, input
    validation, service integration, event emission, error handling, and edge
    cases
log:
  - >-
    Successfully implemented main process chat IPC handlers with comprehensive
    functionality. Created `apps/desktop/src/electron/chatHandlers.ts` following
    established patterns from existing handlers. The implementation includes:


    **Core Features:**

    - `sendToAgents` IPC handler with fire-and-forget pattern for parallel
    processing

    - Input validation for conversationId and userMessageId parameters  

    - Integration with ChatOrchestrationService.processUserMessage() method

    - Event emission system for real-time agent status updates

    - Comprehensive error handling and structured logging


    **Technical Implementation:**

    - Used dependency injection pattern with MainProcessServices

    - Implemented proper event emission to all renderer processes via
    webContents

    - Added secure error handling that sanitizes messages before emission

    - Followed established IPC handler patterns from messagesHandlers.ts and
    conversationsHandlers.ts

    - Used TypeScript interfaces from chatConstants.ts for type safety


    **Quality Assurance:**

    - Created comprehensive unit test suite with 13 test cases covering all
    functionality

    - Tests include input validation, service integration, event emission, and
    error handling scenarios

    - All quality checks passing (lint, format, type-check)

    - All 1,981 tests in the project pass including the new chat handler tests

    - Followed project coding standards and patterns
schema: v1.0
childrenIds: []
created: 2025-08-29T21:28:02.011Z
updated: 2025-08-29T21:28:02.011Z
---

# Implement Main Process Chat IPC Handlers

## Context

Create the main process IPC handlers that bridge the renderer process requests to the ChatOrchestrationService. This handler manages the sendToAgents operation and emits real-time agent update events back to the renderer process.

## Detailed Implementation Requirements

### File Location

Create `apps/desktop/src/electron/chatHandlers.ts`

### Handler Implementation

Follow the established pattern from existing handlers (messagesHandlers.ts, conversationsHandlers.ts):

```typescript
import { ipcMain, webContents } from "electron";
import {
  CHAT_CHANNELS,
  CHAT_EVENTS,
  SendToAgentsRequest,
  AgentUpdateEvent,
} from "../shared/ipc/chatConstants";
import { MainProcessServices } from "../main/services/MainProcessServices";
import { logger } from "@fishbowl-ai/shared";

export function setupChatHandlers(services: MainProcessServices) {
  // sendToAgents handler - fire-and-forget pattern for parallel processing
  ipcMain.handle(
    CHAT_CHANNELS.SEND_TO_AGENTS,
    async (event, request: SendToAgentsRequest): Promise<void> => {
      try {
        // Input validation
        // Integration with ChatOrchestrationService
        // Event emission for agent status updates
        // Error handling and logging
      } catch (error) {
        // Handle and log errors securely
      }
    },
  );
}
```

### ChatOrchestrationService Integration

- Access the service via `services.chatOrchestrationService`
- Call `processUserMessage(conversationId, userMessageId)` method
- Handle the processing workflow and status updates

### Event Emission System

Emit agent update events as agents change status:

```typescript
// Emit agent status updates
const emitAgentUpdate = (eventData: AgentUpdateEvent) => {
  webContents.getAllWebContents().forEach((contents) => {
    if (!contents.isDestroyed()) {
      contents.send(CHAT_EVENTS.AGENT_UPDATE, eventData);
    }
  });
};
```

### Error Handling Strategy

- Validate conversationId and userMessageId parameters
- Handle ChatOrchestrationService failures gracefully
- Emit error events for agent-specific failures
- Log structured error information for debugging
- Never expose internal service details to renderer

### Handler Registration

Ensure the handler is registered in the main Electron process initialization following the established pattern from other handlers.

## Acceptance Criteria

**Functional Requirements:**

- ✅ sendToAgents IPC handler implemented with proper input validation
- ✅ Integration with ChatOrchestrationService.processUserMessage()
- ✅ Real-time agent:update event emission for status changes
- ✅ Support for thinking/complete/error status transitions
- ✅ Optional all:complete event when all agents finish processing
- ✅ Fire-and-forget pattern (returns void, not awaitable)

**Error Handling:**

- ✅ Input validation for conversationId and userMessageId
- ✅ Service failure handling with appropriate error events
- ✅ Structured logging for debugging without exposing internals
- ✅ Graceful handling of partial agent failures
- ✅ Safe error message sanitization for renderer consumption

**Technical Requirements:**

- ✅ Follow established IPC handler patterns from existing handlers
- ✅ Use TypeScript interfaces from chatConstants.ts
- ✅ Proper integration with MainProcessServices dependency injection
- ✅ Event emission to all active renderer processes
- ✅ Resource cleanup and memory management

**Testing Requirements:**

- ✅ Unit tests for handler registration and basic functionality
- ✅ Test input validation scenarios (invalid IDs, missing parameters)
- ✅ Test ChatOrchestrationService integration and method calls
- ✅ Test event emission timing and payload structure
- ✅ Test error handling and recovery scenarios
- ✅ Mock ChatOrchestrationService for isolated testing

## Out of Scope

- Preload API exposure (separate task)
- ChatOrchestrationService implementation (already exists)
- UI state management (separate task)

## Dependencies

- **T-create-ipc-constants-for-chat**: Requires CHAT_CHANNELS and type definitions
- **F-chat-orchestration-service**: Requires ChatOrchestrationService to be available in MainProcessServices

## Security Considerations

- Validate all inputs in main process before service calls
- Sanitize error messages before emitting to renderer
- Never expose ChatOrchestrationService directly to renderer
- Implement proper authorization checks for conversation access

## Performance Considerations

- Use fire-and-forget pattern to avoid blocking renderer
- Efficient event emission to multiple renderer processes
- Minimal serialization overhead for event payloads
- Proper resource cleanup after processing completion
