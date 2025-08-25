---
id: T-add-conversationagent-methods
title: Add conversationAgent methods to preload bridge
status: open
priority: medium
parent: F-service-layer-and-ipc
prerequisites:
  - T-define-ipc-constants-and
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-25T05:18:47.798Z
updated: 2025-08-25T05:18:47.798Z
---

# Add conversationAgent methods to preload bridge

## Context

Add conversationAgent namespace and methods to the Electron preload bridge API, enabling the renderer process to safely invoke conversation agent operations. This follows the established patterns used by conversations, settings, and other subsystems.

## Reference Implementation Patterns

- **Preload Structure**: Follow `electronAPI.conversations` pattern in `preload.ts`
- **Error Handling**: Use consistent try/catch with logger.error patterns
- **Type Safety**: Import and use established IPC types
- **Method Organization**: Group related methods under namespace object

## Technical Approach

Extend the existing `electronAPI` object with a `conversationAgent` namespace containing type-safe methods that invoke the IPC handlers.

## Implementation Requirements

### 1. Import Required Types

**File**: `apps/desktop/src/electron/preload.ts`

Add import for conversation agent IPC types:

```typescript
// Existing imports...
import {
  CONVERSATION_AGENT_CHANNELS,
  type ConversationAgentGetByConversationRequest,
  type ConversationAgentGetByConversationResponse,
  type ConversationAgentAddRequest,
  type ConversationAgentAddResponse,
  type ConversationAgentRemoveRequest,
  type ConversationAgentRemoveResponse,
} from "../shared/ipc";
```

### 2. Add conversationAgent Namespace

**Location**: Within the existing `electronAPI` object definition

```typescript
conversationAgent: {
  getByConversation: async (conversationId: string): Promise<ConversationAgentViewModel[]> => {
    // Implementation...
  },
  add: async (conversationId: string, agentId: string, displayOrder?: number): Promise<ConversationAgentViewModel> => {
    // Implementation...
  },
  remove: async (conversationId: string, agentId: string): Promise<void> => {
    // Implementation...
  },
},
```

### 3. Method Implementations

**getByConversation Method**:

```typescript
getByConversation: async (conversationId: string): Promise<ConversationAgentViewModel[]> => {
  try {
    const request: ConversationAgentGetByConversationRequest = { conversationId };
    const response = (await ipcRenderer.invoke(
      CONVERSATION_AGENT_CHANNELS.GET_BY_CONVERSATION,
      request,
    )) as ConversationAgentGetByConversationResponse;

    if (!response.success) {
      throw new Error(
        response.error?.message || "Failed to get conversation agents"
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
```

**add Method**:

```typescript
add: async (
  conversationId: string,
  agentId: string,
  displayOrder?: number,
): Promise<ConversationAgentViewModel> => {
  try {
    const request: ConversationAgentAddRequest = {
      conversationId,
      agentId,
      displayOrder,
    };
    const response = (await ipcRenderer.invoke(
      CONVERSATION_AGENT_CHANNELS.ADD,
      request,
    )) as ConversationAgentAddResponse;

    if (!response.success) {
      // Handle validation errors with detailed messages
      if (response.error?.code === "VALIDATION_ERROR") {
        const validationError = new Error(response.error.message);
        validationError.name = "ValidationError";
        throw validationError;
      }

      // Handle duplicate agent errors
      if (response.error?.code === "DUPLICATE_AGENT_ERROR") {
        const duplicateError = new Error(response.error.message);
        duplicateError.name = "DuplicateAgentError";
        throw duplicateError;
      }

      throw new Error(
        response.error?.message || "Failed to add agent to conversation"
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
```

**remove Method**:

```typescript
remove: async (conversationId: string, agentId: string): Promise<void> => {
  try {
    const request: ConversationAgentRemoveRequest = {
      conversationId,
      agentId,
    };
    const response = (await ipcRenderer.invoke(
      CONVERSATION_AGENT_CHANNELS.REMOVE,
      request,
    )) as ConversationAgentRemoveResponse;

    if (!response.success) {
      throw new Error(
        response.error?.message || "Failed to remove agent from conversation"
      );
    }
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
```

### 4. Type Definitions Update

**File**: `apps/desktop/src/shared/types/electronAPI.ts`

Add conversationAgent namespace to ElectronAPI interface:

```typescript
// Existing interface...
export interface ElectronAPI {
  // ... existing properties

  conversationAgent: {
    getByConversation(
      conversationId: string,
    ): Promise<ConversationAgentViewModel[]>;
    add(
      conversationId: string,
      agentId: string,
      displayOrder?: number,
    ): Promise<ConversationAgentViewModel>;
    remove(conversationId: string, agentId: string): Promise<void>;
  };
}
```

### Error Handling Patterns

**Validation Error Handling**:

- Detect and preserve validation errors from service layer
- Create named error types for specific error scenarios
- Include context information for debugging

**Communication Error Handling**:

- Consistent error logging for all operations
- Transform unknown errors to meaningful messages
- Preserve original error when possible

**Response Validation**:

- Check response.success before accessing data
- Handle missing data gracefully with defaults
- Validate response structure matches expected types

### Testing Requirements

**Unit Tests in same task**:

**File**: `apps/desktop/src/electron/__tests__/preload.conversationAgent.test.ts`

```typescript
import { contextBridge, ipcRenderer } from "electron";
import type { ConversationAgentViewModel } from "@fishbowl-ai/ui-shared";
import { CONVERSATION_AGENT_CHANNELS } from "../../shared/ipc";

// Mock setup and test implementation
describe("Preload ConversationAgent API", () => {
  test("getByConversation should invoke correct IPC channel", async () => {
    // Test IPC channel invocation
  });

  test("getByConversation should return conversation agents", async () => {
    // Test successful response handling
  });

  test("getByConversation should handle errors", async () => {
    // Test error handling and logging
  });

  test("add should invoke correct IPC channel with parameters", async () => {
    // Test IPC channel invocation with parameters
  });

  test("add should handle validation errors", async () => {
    // Test validation error handling
  });

  test("add should handle duplicate errors", async () => {
    // Test duplicate error handling
  });

  test("remove should invoke correct IPC channel", async () => {
    // Test IPC channel invocation
  });

  test("remove should handle not found errors", async () => {
    // Test not found error handling
  });
});
```

**Test Coverage**:

- IPC channel invocation verification
- Parameter passing validation
- Success response handling
- Error response handling and logging
- Error type preservation (validation, duplicate, etc.)
- Type safety validation

## Dependencies

- IPC constants and types (T-define-ipc-constants-and)
- ConversationAgentViewModel type (already implemented)
- Existing preload bridge infrastructure
- Error handling utilities

## Acceptance Criteria

- [ ] conversationAgent namespace added to electronAPI object
- [ ] getByConversation method returns ConversationAgentViewModel array
- [ ] add method validates parameters and returns created ConversationAgentViewModel
- [ ] remove method handles deletion by conversationId and agentId
- [ ] All methods use correct IPC channels and request types
- [ ] Comprehensive error handling with logging
- [ ] Error type preservation (validation, duplicate, etc.)
- [ ] ElectronAPI interface updated with conversationAgent namespace
- [ ] Unit tests covering all methods and error scenarios
- [ ] Type safety validation in tests

## Implementation Notes

- Methods should have clean, simple signatures matching business operations
- Error handling preserves specific error types for UI feedback
- The namespace approach keeps the API organized and discoverable
- Testing validates both happy path and error scenarios
- This completes the IPC bridge between renderer and main process
