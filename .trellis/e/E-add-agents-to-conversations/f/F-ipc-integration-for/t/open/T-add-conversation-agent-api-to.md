---
id: T-add-conversation-agent-api-to
title: Add conversation agent API to preload bridge
status: open
priority: medium
parent: F-ipc-integration-for
prerequisites:
  - T-implement-conversation-agent
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-25T06:06:25.500Z
updated: 2025-08-25T06:06:25.500Z
---

# Add Conversation Agent API to Preload Bridge

## Context

Add conversation agent methods to the `electronAPI` object in the preload script, enabling the renderer process to communicate with the main process for conversation agent operations. This follows the exact pattern established for conversations, settings, and other IPC APIs.

## Implementation Requirements

### Update Preload Script (`apps/desktop/src/electron/preload.ts`)

#### Add Conversation Agent API Section

Insert the following section into the `electronAPI` object (around line 674, after the conversations section):

```typescript
conversationAgent: {
  getByConversation: async (conversationId: string): Promise<ConversationAgent[]> => {
    try {
      const response = (await ipcRenderer.invoke(
        CONVERSATION_AGENT_CHANNELS.GET_BY_CONVERSATION,
        { conversationId },
      )) as ConversationAgentGetByConversationResponse;
      if (!response.success) {
        throw new Error(
          response.error?.message || "Failed to get conversation agents",
        );
      }
      return response.data || [];
    } catch (error) {
      logger.error(
        "Error getting conversation agents:",
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error instanceof Error
        ? error
        : new Error("Failed to communicate with main process");
    }
  },
  add: async (input: AddAgentToConversationInput): Promise<ConversationAgent> => {
    try {
      const response = (await ipcRenderer.invoke(
        CONVERSATION_AGENT_CHANNELS.ADD,
        input,
      )) as ConversationAgentAddResponse;
      if (!response.success) {
        throw new Error(
          response.error?.message || "Failed to add agent to conversation",
        );
      }
      return response.data!;
    } catch (error) {
      logger.error(
        "Error adding agent to conversation:",
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error instanceof Error
        ? error
        : new Error("Failed to communicate with main process");
    }
  },
  remove: async (input: RemoveAgentFromConversationInput): Promise<boolean> => {
    try {
      const response = (await ipcRenderer.invoke(
        CONVERSATION_AGENT_CHANNELS.REMOVE,
        input,
      )) as ConversationAgentRemoveResponse;
      if (!response.success) {
        throw new Error(
          response.error?.message || "Failed to remove agent from conversation",
        );
      }
      return response.data || false;
    } catch (error) {
      logger.error(
        "Error removing agent from conversation:",
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error instanceof Error
        ? error
        : new Error("Failed to communicate with main process");
    }
  },
  list: async (): Promise<ConversationAgent[]> => {
    try {
      const response = (await ipcRenderer.invoke(
        CONVERSATION_AGENT_CHANNELS.LIST,
        {},
      )) as ConversationAgentListResponse;
      if (!response.success) {
        throw new Error(
          response.error?.message || "Failed to list conversation agents",
        );
      }
      return response.data || [];
    } catch (error) {
      logger.error(
        "Error listing conversation agents:",
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error instanceof Error
        ? error
        : new Error("Failed to communicate with main process");
    }
  },
},
```

### Required Imports

Add necessary imports at the top of the file:

```typescript
import {
  CONVERSATION_AGENT_CHANNELS,
  ConversationAgentGetByConversationResponse,
  ConversationAgentAddResponse,
  ConversationAgentRemoveResponse,
  ConversationAgentListResponse,
} from "../shared/ipc";
import type {
  ConversationAgent,
  AddAgentToConversationInput,
  RemoveAgentFromConversationInput,
} from "@fishbowl-ai/shared";
```

### Update ElectronAPI Type Definition

Update the `ElectronAPI` interface (if separate file) or ensure TypeScript recognizes the new methods:

```typescript
conversationAgent: {
  getByConversation(conversationId: string): Promise<ConversationAgent[]>;
  add(input: AddAgentToConversationInput): Promise<ConversationAgent>;
  remove(input: RemoveAgentFromConversationInput): Promise<boolean>;
  list(): Promise<ConversationAgent[]>;
};
```

## Technical Requirements

### Error Handling

- Follow exact pattern from other API methods in preload
- Catch and re-throw errors with meaningful messages
- Log errors at appropriate level with context
- Maintain error types for proper handling in renderer

### Type Safety

- Use proper TypeScript types for all parameters and return values
- Import types from shared package and IPC definitions
- Ensure IntelliSense support for renderer process usage

### Method Signatures

- `getByConversation`: Single string parameter, returns array
- `add`: Input object parameter, returns created agent
- `remove`: Input object parameter, returns boolean success
- `list`: No parameters, returns all agents array

## Acceptance Criteria

- ✅ Conversation agent API section added to electronAPI object
- ✅ All four methods implemented with proper signatures
- ✅ Error handling follows established preload patterns
- ✅ Import statements added for required types and channels
- ✅ TypeScript compilation succeeds without errors
- ✅ Methods callable from renderer process
- ✅ Proper error propagation to caller
- ✅ Logging implemented for error scenarios

## Testing Requirements

### Unit Tests

Create/update `apps/desktop/src/electron/__tests__/preload.conversations.test.ts`:

- Test successful API method calls
- Test error handling scenarios
- Verify proper IPC channel usage
- Test parameter validation and type safety
- Mock ipcRenderer.invoke calls

### Integration Tests

- API methods accessible from renderer process
- Methods properly communicate with main process handlers
- Error responses properly handled and thrown
- Type definitions work correctly in renderer

## Implementation Notes

### Reference Pattern

- **Follow exactly**: `conversations` API section in preload.ts
- **Error handling**: Same try/catch structure and error messaging
- **Logging**: Use same logger and error formatting
- **Type imports**: Follow import patterns from existing APIs

### Method Implementation Details

- **getByConversation**: Returns empty array if no agents found (not null)
- **add**: Returns the created ConversationAgent object
- **remove**: Returns boolean indicating success/failure
- **list**: For debugging purposes, returns all conversation agents

### Dependencies

- IPC handlers must be implemented and registered first
- Type definitions for requests/responses must exist
- Shared package types (ConversationAgent, input types) must be available
- Electron ipcRenderer for communication

### Integration Points

- Renderer components will call `window.electronAPI.conversationAgent.*`
- Main process handlers will receive and process these calls
- Repository operations execute in main process for security
