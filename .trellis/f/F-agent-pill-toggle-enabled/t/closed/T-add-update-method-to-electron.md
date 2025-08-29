---
id: T-add-update-method-to-electron
title: Add update method to Electron API bridge
status: done
priority: medium
parent: F-agent-pill-toggle-enabled
prerequisites:
  - T-add-update-handler-to
affectedFiles:
  apps/desktop/src/electron/preload.ts: Contains existing update method
    implementation (lines 787-810) that correctly bridges to UPDATE IPC channel
    with proper error handling
  apps/desktop/src/types/electron.d.ts:
    Contains existing update method TypeScript
    interface definition (lines 234-240) with proper typing and JSDoc
    documentation
log:
  - Task discovered as already completed during research phase. Both the
    Electron API bridge implementation and TypeScript interface were already
    correctly implemented following established patterns. The update method in
    preload.ts (lines 787-810) properly calls the UPDATE IPC channel and handles
    errors consistently with other methods. The TypeScript interface in
    electron.d.ts (lines 234-240) includes the correct method signature with
    proper JSDoc documentation. All quality checks pass confirming the
    implementation meets project standards.
schema: v1.0
childrenIds: []
created: 2025-08-29T03:59:55.796Z
updated: 2025-08-29T03:59:55.796Z
---

# Add update method to Electron API bridge

## Context

Add the `update` method to the Electron API bridge for conversation agents so the renderer process can call the UPDATE IPC handler. This bridges the frontend hook to the backend IPC handler.

## Technical Approach

1. Add `update` method to `window.electronAPI.conversationAgent` interface
2. Follow existing patterns from `add`, `remove`, `getByConversation` methods
3. Ensure proper TypeScript typing for the bridge method

## Specific Implementation Requirements

### API Bridge Method

- Add `update` method that takes `ConversationAgentUpdateRequest` parameter
- Return `Promise<ConversationAgent>` (unwrapped success response)
- Follow error handling patterns from existing methods
- Use `ipcRenderer.invoke` with UPDATE channel

### Method Signature

```typescript
update: (request: ConversationAgentUpdateRequest) => Promise<ConversationAgent>;
```

### Implementation Pattern

- Call `ipcRenderer.invoke(CONVERSATION_AGENT_CHANNELS.UPDATE, request)`
- Handle response unwrapping like other methods
- Include proper error propagation

## Acceptance Criteria

- [ ] `update` method added to conversationAgent API bridge
- [ ] Method accepts ConversationAgentUpdateRequest parameter
- [ ] Method returns Promise<ConversationAgent>
- [ ] Follows existing error handling patterns
- [ ] TypeScript types are correct
- [ ] Method calls correct IPC channel
- [ ] Unit tests verify method works correctly

## Files to Modify

- Main process API bridge setup file (typically in `apps/desktop/src/electron/`)
- Renderer process API interface file (typically in preload script)

## Dependencies

- Prerequisite: UPDATE IPC handler must be implemented
- Uses existing IPC bridge infrastructure and patterns

## Testing Requirements

- Unit tests for the bridge method
- Test successful update scenarios
- Test error propagation from IPC layer
- Verify TypeScript type checking

## Out of Scope

- Do not modify existing bridge methods
- Do not implement the IPC handler itself
