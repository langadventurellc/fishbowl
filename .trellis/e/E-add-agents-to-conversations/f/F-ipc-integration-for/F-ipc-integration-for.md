---
id: F-ipc-integration-for
title: IPC Integration for Conversation Agents
status: in-progress
priority: medium
parent: E-add-agents-to-conversations
prerequisites: []
affectedFiles:
  apps/desktop/src/main/services/MainProcessServices.ts: Added
    ConversationAgentsRepository import, property declaration, and constructor
    initialization following the exact pattern of conversationsRepository
    integration
  apps/desktop/src/shared/ipc/conversationAgentsConstants.ts: Created channel
    constants for conversation agent operations with consistent naming
    convention
  apps/desktop/src/shared/ipc/conversationAgents/conversationAgentGetByConversationRequest.ts: Request interface for getting agents by conversation ID
  apps/desktop/src/shared/ipc/conversationAgents/conversationAgentAddRequest.ts:
    Request interface for adding agent to conversation, extends
    AddAgentToConversationInput
  apps/desktop/src/shared/ipc/conversationAgents/conversationAgentRemoveRequest.ts:
    Request interface for removing agent from conversation, extends
    RemoveAgentFromConversationInput
  apps/desktop/src/shared/ipc/conversationAgents/conversationAgentListRequest.ts: Request interface for listing all conversation agents (debugging)
  apps/desktop/src/shared/ipc/conversationAgents/conversationAgentGetByConversationResponse.ts: Response interface returning array of ConversationAgent
  apps/desktop/src/shared/ipc/conversationAgents/conversationAgentAddResponse.ts: Response interface returning created ConversationAgent
  apps/desktop/src/shared/ipc/conversationAgents/conversationAgentRemoveResponse.ts: Response interface returning boolean success indicator
  apps/desktop/src/shared/ipc/conversationAgents/conversationAgentListResponse.ts: Response interface returning array of all ConversationAgent (debugging)
  apps/desktop/src/shared/ipc/index.ts: Added exports for conversation agent
    constants, channel types, request types, and response types
  apps/desktop/src/shared/ipc/__tests__/conversationAgentsIPC.test.ts:
    Comprehensive unit tests with 11 passing tests covering constants, types,
    exports, and error handling
  apps/desktop/src/electron/conversationAgentHandlers.ts:
    Created new IPC handlers
    file with 4 conversation agent channels following conversationsHandlers.ts
    pattern. Includes GET_BY_CONVERSATION, ADD, REMOVE, and LIST handlers with
    proper error handling, logging, and TypeScript typing.
  apps/desktop/src/electron/main.ts: Added import for
    setupConversationAgentHandlers and registered conversation agent IPC
    handlers in main process initialization with error handling
  apps/desktop/src/electron/preload.ts: Added conversationAgent API section to
    electronAPI object with getByConversation, add, remove, and list methods.
    Added imports for CONVERSATION_AGENT_CHANNELS, conversation agent response
    types, and shared types (ConversationAgent, AddAgentToConversationInput,
    RemoveAgentFromConversationInput). Each method follows established IPC
    patterns with proper error handling and logging.
  apps/desktop/src/types/electron.d.ts: Added conversationAgent property to
    ElectronAPI interface with complete TypeScript type definitions for all four
    methods, including proper JSDoc documentation for each method signature.
log: []
schema: v1.0
childrenIds:
  - T-add-conversation-agent-api-to
  - T-register-conversation-agent
  - T-create-ipc-requestresponse
  - T-implement-conversation-agent
  - T-integrate-conversationagentsre
created: 2025-08-25T05:58:32.122Z
updated: 2025-08-25T05:58:32.122Z
---

# IPC Integration for Conversation Agents

## Purpose

Implement the IPC (Inter-Process Communication) layer to enable the desktop renderer process to communicate with the main process for conversation agent operations, following the established conversation patterns.

## Functionality

Create the communication bridge between the UI and the data layer using Electron's IPC system, enabling secure database operations from the renderer process.

## Key Components to Implement

### 1. IPC Handlers (`apps/desktop/src/electron/conversationAgentHandlers.ts`)

- `conversationAgent:getByConversation` - Retrieve agents for a specific conversation
- `conversationAgent:add` - Add an agent to a conversation
- `conversationAgent:remove` - Remove an agent from a conversation
- `conversationAgent:list` - List all conversation agents (for debugging)

### 2. MainProcessServices Integration

- Wire `ConversationAgentsRepository` into `MainProcessServices.constructor`
- Follow exact pattern used for `conversationsRepository`
- Enable dependency injection for IPC handlers

### 3. Preload Bridge (`apps/desktop/src/preload/index.ts`)

- Add `conversationAgent` methods to `electronAPI`
- Type-safe method signatures matching IPC channels
- Consistent with existing conversation API structure

## Detailed Acceptance Criteria

### Functional Requirements

- ✅ IPC handlers respond to all required conversation agent operations
- ✅ Repository is properly initialized in MainProcessServices
- ✅ All database operations execute successfully via IPC calls
- ✅ Error handling follows existing conversation handler patterns
- ✅ Proper logging for all operations (debug, info, error levels)
- ✅ Request/response validation using existing type schemas

### Technical Requirements

- ✅ Channel names follow convention: `conversationAgent:action`
- ✅ Response format matches existing patterns: `{ success: boolean, data?: T, error?: SerializedError }`
- ✅ Direct repository usage in handlers (no service layer)
- ✅ Proper TypeScript interfaces for all request/response types
- ✅ Error serialization for cross-process communication

### Integration Points

- ✅ Repository instantiated alongside `conversationsRepository` in MainProcessServices
- ✅ Handlers registered in main process initialization
- ✅ Preload API exposes methods for renderer process consumption
- ✅ No conflicts with existing IPC channel names

## Implementation Guidance

### Repository Integration Pattern

```typescript
// In MainProcessServices.constructor
this.conversationAgentsRepository = new ConversationAgentsRepository(
  this.databaseBridge,
  this.cryptoUtils,
);
```

### IPC Handler Pattern

```typescript
// Follow conversationsHandlers.ts structure exactly
ipcMain.handle(
  CONVERSATION_AGENT_CHANNELS.GET_BY_CONVERSATION,
  async (
    _event,
    request: ConversationAgentsGetByConversationRequest,
  ): Promise<ConversationAgentsGetByConversationResponse> => {
    logger.debug("Getting conversation agents", {
      conversationId: request.conversationId,
    });
    try {
      const agents =
        await mainServices.conversationAgentsRepository.getByConversation(
          request.conversationId,
        );
      return { success: true, data: agents };
    } catch (error) {
      logger.error("Failed to get conversation agents", error as Error);
      return { success: false, error: serializeError(error) };
    }
  },
);
```

### Preload Bridge Pattern

```typescript
// Add to electronAPI object
conversationAgent: {
  getByConversation: (conversationId: string) =>
    ipcRenderer.invoke(CONVERSATION_AGENT_CHANNELS.GET_BY_CONVERSATION, { conversationId }),
  add: (input: AddAgentToConversationInput) =>
    ipcRenderer.invoke(CONVERSATION_AGENT_CHANNELS.ADD, input),
  remove: (input: RemoveAgentFromConversationInput) =>
    ipcRenderer.invoke(CONVERSATION_AGENT_CHANNELS.REMOVE, input),
}
```

## Testing Requirements

- ✅ Integration tests for each IPC handler
- ✅ Error case testing (invalid IDs, duplicate agents, etc.)
- ✅ Repository method calls verified in handler tests
- ✅ Preload API method availability tests

## Security Considerations

- ✅ All database operations restricted to main process
- ✅ Input validation using existing Zod schemas
- ✅ Proper error handling prevents information leakage
- ✅ Channel names prevent conflicts with other IPC operations

## Dependencies

- ConversationAgentsRepository (already implemented)
- Type definitions and schemas (already implemented)
- Existing IPC infrastructure patterns
- MainProcessServices class structure
