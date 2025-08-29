---
id: T-extend-preload-interface-with
title: Extend preload interface with messages API
status: open
priority: high
parent: F-messages-ipc-bridge
prerequisites:
  - T-create-messages-ipc-channel
  - T-implement-messages-ipc
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-29T17:44:07.398Z
updated: 2025-08-29T17:44:07.398Z
---

# Extend Preload Interface with Messages API

## Context and Background

Extend the centralized preload interface to expose secure messages API to the renderer process. This provides the critical communication bridge while maintaining the security boundary between renderer and main process.

### Related Issues

- **Parent Feature**: F-messages-ipc-bridge (Messages IPC Bridge)
- **Epic**: E-message-system-foundation (Message System Foundation)
- **Project**: P-complete-multi-agent-chat (Complete Multi-Agent Chat)
- **Prerequisites**:
  - T-create-messages-ipc-channel (IPC types must exist)
  - T-implement-messages-ipc (Main process handlers must exist)

### Reference Patterns

Follow exact patterns from existing preload implementations:

- `apps/desktop/src/electron/preload.ts` - API structure and error handling
- `apps/desktop/src/types/electron.d.ts` - TypeScript interface definitions
- Existing `conversations` and `conversationAgent` APIs for consistency

## Detailed Implementation Requirements

### 1. Extend Preload electronAPI Object

**File**: `apps/desktop/src/electron/preload.ts`

Add messages API to existing electronAPI object:

```typescript
// Add import
import {
  MESSAGES_CHANNELS,
  MessagesListRequest,
  MessagesListResponse,
  MessagesCreateRequest,
  MessagesCreateResponse,
  MessagesUpdateInclusionRequest,
  MessagesUpdateInclusionResponse,
} from "../shared/ipc/index.js";
import { CreateMessageInput, Message } from "@fishbowl-ai/shared";

// Extend electronAPI object
const electronAPI: ElectronAPI = {
  // ... existing properties ...
  messages: {
    list: async (conversationId: string): Promise<Message[]> => {
      try {
        const request: MessagesListRequest = { conversationId };
        const response = (await ipcRenderer.invoke(
          MESSAGES_CHANNELS.LIST,
          request,
        )) as MessagesListResponse;
        if (!response.success) {
          throw new Error(response.error?.message || "Failed to list messages");
        }
        return response.data || [];
      } catch (error) {
        logger.error(
          "Error listing messages:",
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error instanceof Error
          ? error
          : new Error("Failed to communicate with main process");
      }
    },
    create: async (input: CreateMessageInput): Promise<Message> => {
      try {
        const request: MessagesCreateRequest = { input };
        const response = (await ipcRenderer.invoke(
          MESSAGES_CHANNELS.CREATE,
          request,
        )) as MessagesCreateResponse;
        if (!response.success) {
          throw new Error(
            response.error?.message || "Failed to create message",
          );
        }
        return response.data!;
      } catch (error) {
        logger.error(
          "Error creating message:",
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error instanceof Error
          ? error
          : new Error("Failed to communicate with main process");
      }
    },
    updateInclusion: async (
      id: string,
      included: boolean,
    ): Promise<Message> => {
      try {
        const request: MessagesUpdateInclusionRequest = { id, included };
        const response = (await ipcRenderer.invoke(
          MESSAGES_CHANNELS.UPDATE_INCLUSION,
          request,
        )) as MessagesUpdateInclusionResponse;
        if (!response.success) {
          throw new Error(
            response.error?.message || "Failed to update message inclusion",
          );
        }
        return response.data!;
      } catch (error) {
        logger.error(
          "Error updating message inclusion:",
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error instanceof Error
          ? error
          : new Error("Failed to communicate with main process");
      }
    },
  },
};
```

### 2. Extend TypeScript Interface Definition

**File**: `apps/desktop/src/types/electron.d.ts`

Add messages interface to ElectronAPI:

```typescript
import { CreateMessageInput, Message } from "@fishbowl-ai/shared";

interface MessagesAPI {
  list(conversationId: string): Promise<Message[]>;
  create(input: CreateMessageInput): Promise<Message>;
  updateInclusion(id: string, included: boolean): Promise<Message>;
}

interface ElectronAPI {
  // ... existing properties ...
  messages: MessagesAPI;
}
```

## Technical Requirements

### Error Handling Strategy

- Follow exact patterns from existing API implementations
- Convert IPC errors to user-friendly messages
- Provide consistent error format across all operations
- Use structured logging with proper error context
- Handle network/communication failures gracefully
- Never expose internal process details in error messages

### Input Validation

- Perform minimal guard checks (presence/primitive type validation)
- Rely on main process and repository for comprehensive schema validation
- Validate required parameters before IPC invocation
- Handle optional parameters consistently with defaults
- Sanitize error messages from main process

### Type Safety Requirements

- Full TypeScript coverage across IPC boundary
- Use exact shared types (CreateMessageInput, Message)
- Proper optional/required parameter handling
- Consistent Promise return types
- Runtime type validation matches compile-time expectations

### Integration with Centralized Preload

- Extend existing electronAPI object (don't create separate)
- Follow established contextBridge.exposeInMainWorld pattern
- Maintain consistency with other API modules (conversations, settings, etc.)
- Use same logger instance and error handling patterns
- Integrate with existing security measures

## Acceptance Criteria

### API Implementation

- [x] `messages.list(conversationId)` returns Promise<Message[]>
- [x] `messages.create(input)` returns Promise<Message>
- [x] `messages.updateInclusion(id, included)` returns Promise<Message>
- [x] All methods follow exact error handling patterns from existing APIs
- [x] Proper integration with centralized electronAPI object

### Type Safety

- [x] TypeScript interfaces defined in electron.d.ts
- [x] Full type coverage with no `any` types
- [x] Runtime types match compile-time interfaces
- [x] Proper import/export of shared types
- [x] TypeScript compilation without errors

### Error Handling

- [x] Consistent error format across operations: `{ message: string }`
- [x] User-friendly error messages without internal details
- [x] Proper logging with structured metadata
- [x] Graceful handling of IPC communication failures
- [x] Error boundary prevents crashes in renderer

### Security & Integration

- [x] No direct database access from renderer (all through IPC)
- [x] Input validation prevents malformed requests
- [x] Integration with existing preload architecture
- [x] Follows established security patterns
- [x] Compatible with existing contextBridge exposure

## Testing Requirements

### Unit Tests

Create `apps/desktop/src/electron/__tests__/preload-messages.test.ts`:

- Mock IPC communication and verify parameter passing
- Test successful response handling for all operations
- Test error scenario handling and user-friendly messages
- Verify TypeScript interfaces match runtime behavior
- Test integration with existing preload architecture

### Integration Tests

- Full renderer → preload → main → repository → response flow
- Test all message operations with real data
- Verify error propagation across process boundary
- Test concurrent operation handling
- Performance testing under typical load

### Type Tests

- Verify interface contracts across process boundary
- Test runtime type validation matches compile-time
- Validate shared package type imports work correctly
- Test optional parameter handling

## Dependencies

- **Prerequisites**:
  - T-create-messages-ipc-channel (Type definitions must exist)
  - T-implement-messages-ipc (Main process handlers must be implemented)
- **Shared Types**: Message, CreateMessageInput from @fishbowl-ai/shared
- **Existing Infrastructure**: Centralized preload architecture and contextBridge
- **Patterns**: Established IPC communication and error handling patterns

## Out of Scope

- No renderer hooks implementation (separate tasks)
- No UI component integration (separate concerns)
- No caching or performance optimizations (direct IPC communication)
- No real-time updates or event streaming (separate feature)
- No batch operations (single operations only)
