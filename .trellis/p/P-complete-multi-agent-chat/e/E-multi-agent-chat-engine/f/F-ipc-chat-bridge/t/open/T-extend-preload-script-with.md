---
id: T-extend-preload-script-with
title: Extend preload script with chat API
status: open
priority: high
parent: F-ipc-chat-bridge
prerequisites:
  - T-create-ipc-constants-for-chat
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-29T21:28:29.433Z
updated: 2025-08-29T21:28:29.433Z
---

# Extend Preload Script with Chat API

## Context

Extend the existing preload script to expose secure chat API methods to the renderer process. This provides the bridge between the renderer UI and main process chat handlers while maintaining Electron's security boundaries.

## Detailed Implementation Requirements

### File Location

Extend `apps/desktop/src/electron/preload.ts` - add chat API to existing electronAPI object

### Chat API Implementation

Add chat property to the existing electronAPI object:

```typescript
// In electronAPI object
chat: {
  sendToAgents: async (conversationId: string, userMessageId: string): Promise<void> => {
    try {
      const request: SendToAgentsRequest = { conversationId, userMessageId };
      await ipcRenderer.invoke(CHAT_CHANNELS.SEND_TO_AGENTS, request);
    } catch (error) {
      logger.error(
        "Error sending to agents:",
        error instanceof Error ? error : new Error(String(error))
      );
      throw error instanceof Error
        ? error
        : new Error("Failed to communicate with main process");
    }
  },

  onAgentUpdate: (callback: (event: AgentUpdateEvent) => void): (() => void) => {
    try {
      // Create wrapped callback to prevent event object exposure
      const wrappedCallback = (_: any, eventData: AgentUpdateEvent) => {
        try {
          callback(eventData);
        } catch (error) {
          logger.error(
            "Error in agent update callback:",
            error instanceof Error ? error : new Error(String(error))
          );
        }
      };

      // Register the IPC listener
      ipcRenderer.on(CHAT_EVENTS.AGENT_UPDATE, wrappedCallback);

      // Return cleanup function
      return () => {
        try {
          ipcRenderer.removeListener(CHAT_EVENTS.AGENT_UPDATE, wrappedCallback);
        } catch (error) {
          logger.error(
            "Error removing agent update listener:",
            error instanceof Error ? error : new Error(String(error))
          );
        }
      };
    } catch (error) {
      logger.error(
        "Error setting up agent update listener:",
        error instanceof Error ? error : new Error(String(error))
      );
      return () => {}; // Return no-op cleanup function if setup fails
    }
  }
}
```

### Security Boundary Implementation

- Follow existing patterns from other preload APIs (settings, messages, etc.)
- Use contextBridge securely without exposing raw Event objects
- Implement proper error handling and cleanup functions
- Sanitize all inputs and outputs across the boundary

### Event Listener Management

- Provide unsubscribe functions for proper cleanup
- Handle renderer process lifecycle events
- Support multiple concurrent listeners if needed
- Follow the established pattern from onOpenSettings implementation

### Import Requirements

Add necessary imports for chat constants and types:

```typescript
import {
  CHAT_CHANNELS,
  CHAT_EVENTS,
  SendToAgentsRequest,
  AgentUpdateEvent,
} from "../shared/ipc/chatConstants";
```

## Acceptance Criteria

**Functional Requirements:**

- ✅ sendToAgents method implemented with proper parameter validation
- ✅ onAgentUpdate method with event listener registration and cleanup
- ✅ Secure contextBridge exposure without Event object leakage
- ✅ Integration with existing electronAPI object structure
- ✅ Proper TypeScript interfaces and error handling

**Security Requirements:**

- ✅ No direct main process access exposed to renderer
- ✅ Input validation and sanitization for all parameters
- ✅ Safe error message handling without internal details
- ✅ Proper cleanup functions to prevent memory leaks
- ✅ Follow established security patterns from existing preload APIs

**Error Handling:**

- ✅ Graceful IPC communication failure handling
- ✅ Structured error logging with appropriate detail levels
- ✅ User-friendly error messages for renderer consumption
- ✅ Fallback behavior when setup fails

**Technical Requirements:**

- ✅ Follow existing preload patterns and conventions
- ✅ Consistent error handling and logging approach
- ✅ Proper TypeScript typing across the boundary
- ✅ Memory-efficient event listener management

**Testing Requirements:**

- ✅ Unit tests for sendToAgents method functionality
- ✅ Unit tests for onAgentUpdate listener registration and cleanup
- ✅ Test error handling scenarios and edge cases
- ✅ Test integration with existing electronAPI structure
- ✅ Mock ipcRenderer for isolated testing

## Out of Scope

- Main process handler implementation (separate task)
- UI components that consume the API (separate feature)
- ChatOrchestrationService logic (already exists)

## Dependencies

- **T-create-ipc-constants-for-chat**: Requires CHAT_CHANNELS and type definitions
- **Existing preload infrastructure**: Builds on established patterns and imports

## Security Considerations

- Never expose Electron Event objects to renderer
- Validate all inputs before sending to main process
- Sanitize all outputs received from main process
- Implement proper cleanup to prevent memory leaks
- Follow principle of least privilege for API surface

## Performance Considerations

- Efficient event listener management and cleanup
- Minimal serialization overhead for IPC communication
- Proper resource cleanup when listeners are removed
- Support for concurrent multi-agent operations
