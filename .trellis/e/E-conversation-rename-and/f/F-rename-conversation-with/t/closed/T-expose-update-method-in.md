---
id: T-expose-update-method-in
title: Expose update method in preload script
status: done
priority: high
parent: F-rename-conversation-with
prerequisites:
  - T-implement-update-ipc-handler
affectedFiles:
  apps/desktop/src/electron/preload.ts: Added update method to
    electronAPI.conversations object following existing create/list/get/delete
    patterns. Imported ConversationsUpdateRequest, ConversationsUpdateResponse,
    and UpdateConversationInput types. Method properly invokes
    CONVERSATION_CHANNELS.UPDATE with correct parameters, handles success/error
    responses, and includes comprehensive error logging.
  apps/desktop/src/electron/__tests__/preload.conversations.test.ts:
    Added comprehensive unit tests for conversations.update method including
    successful update scenario, error response handling, IPC communication error
    handling, contextBridge integration verification, and error logging tests.
    Updated contextBridge integration tests to verify update method is properly
    exposed. All 38 tests passing including new update method coverage.
log:
  - Exposed update method in preload script to enable the renderer process to
    call the UPDATE IPC handler for conversation updates. Added complete
    TypeScript typing with ConversationsAPI interface match. Implemented proper
    error handling following existing patterns (create/list/get/delete) and
    comprehensive unit test coverage with 38 passing tests including success
    cases, error scenarios, and logging verification.
schema: v1.0
childrenIds: []
created: 2025-08-24T19:49:43.030Z
updated: 2025-08-24T19:49:43.030Z
---

# Expose update method in preload script

## Context

Add the update method to the preload script to expose it to the renderer process through the electronAPI. This enables the frontend to call the IPC handler for updating conversations.

## Implementation Requirements

### Files to modify:

- `apps/desktop/src/preload/preload.ts` or similar preload file
- `apps/desktop/src/types/ConversationsAPI.ts` (update method already defined as optional)

### Implementation steps:

1. Locate the conversations API exposure in the preload script
2. Add the update method following the existing create/list/get patterns
3. Ensure proper TypeScript typing with the ConversationsAPI interface

### Code pattern to follow:

```typescript
conversations: {
  create: (title?: string) => ipcRenderer.invoke(CONVERSATION_CHANNELS.CREATE, title),
  list: () => ipcRenderer.invoke(CONVERSATION_CHANNELS.LIST),
  get: (id: string) => ipcRenderer.invoke(CONVERSATION_CHANNELS.GET, id),
  update: (id: string, input: UpdateConversationInput) =>
    ipcRenderer.invoke(CONVERSATION_CHANNELS.UPDATE, id, input),
  // ... other methods
}
```

## Acceptance Criteria

- ✅ Update method exposed in electronAPI.conversations
- ✅ Method signature matches ConversationsAPI interface
- ✅ Properly invokes CONVERSATION_CHANNELS.UPDATE with correct parameters
- ✅ TypeScript types are correct and compile without errors
- ✅ Unit test verifies the method is exposed and callable

## Dependencies

- Task T-implement-update-ipc-handler must be completed first
- ConversationsAPI interface (update method already defined as optional)

## Testing Requirements

Write unit tests that verify:

- Update method is accessible via window.electronAPI.conversations.update
- Method passes correct parameters to ipcRenderer.invoke
- TypeScript compilation succeeds with proper typing
