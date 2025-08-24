---
id: T-expose-delete-method-in
title: Expose delete method in preload script
status: open
priority: high
parent: F-delete-conversation-with
prerequisites:
  - T-implement-delete-ipc-handler
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-24T19:51:13.484Z
updated: 2025-08-24T19:51:13.484Z
---

# Expose delete method in preload script

## Context

Add the delete method to the preload script to expose it to the renderer process through the electronAPI. This enables the frontend to call the IPC handler for deleting conversations.

## Implementation Requirements

### Files to modify:

- `apps/desktop/src/preload/preload.ts` or similar preload file
- `apps/desktop/src/types/ConversationsAPI.ts` (delete method already defined as optional)

### Implementation steps:

1. Locate the conversations API exposure in the preload script
2. Add the delete method following the existing patterns
3. Ensure proper TypeScript typing with the ConversationsAPI interface

### Code pattern to follow:

```typescript
conversations: {
  create: (title?: string) => ipcRenderer.invoke(CONVERSATION_CHANNELS.CREATE, title),
  list: () => ipcRenderer.invoke(CONVERSATION_CHANNELS.LIST),
  get: (id: string) => ipcRenderer.invoke(CONVERSATION_CHANNELS.GET, id),
  update: (id: string, input: UpdateConversationInput) =>
    ipcRenderer.invoke(CONVERSATION_CHANNELS.UPDATE, id, input),
  delete: (id: string) => ipcRenderer.invoke(CONVERSATION_CHANNELS.DELETE, id),
}
```

## Acceptance Criteria

- ✅ Delete method exposed in electronAPI.conversations
- ✅ Method signature matches ConversationsAPI interface (returns Promise<boolean>)
- ✅ Properly invokes CONVERSATION_CHANNELS.DELETE with ID parameter
- ✅ TypeScript types are correct and compile without errors
- ✅ Unit test verifies the method is exposed and callable

## Dependencies

- Task T-implement-delete-ipc-handler must be completed first
- ConversationsAPI interface (delete method already defined as optional)

## Testing Requirements

Write unit tests that verify:

- Delete method is accessible via window.electronAPI.conversations.delete
- Method passes correct ID parameter to ipcRenderer.invoke
- TypeScript compilation succeeds with proper typing
- Return type is Promise<boolean>
