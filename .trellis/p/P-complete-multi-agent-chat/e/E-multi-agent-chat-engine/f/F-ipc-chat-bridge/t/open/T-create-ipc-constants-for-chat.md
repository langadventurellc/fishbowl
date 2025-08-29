---
id: T-create-ipc-constants-for-chat
title: Create IPC constants for chat operations
status: open
priority: high
parent: F-ipc-chat-bridge
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-29T21:27:36.550Z
updated: 2025-08-29T21:27:36.550Z
---

# Create IPC Constants for Chat Operations

## Context

The IPC Chat Bridge requires standardized channel names and event types following the established patterns in the codebase (similar to CONVERSATION_CHANNELS, MESSAGES_CHANNELS, etc.). This task creates the foundational constants needed for secure IPC communication between renderer and main processes.

## Detailed Implementation Requirements

### File Location

Create `apps/desktop/src/shared/ipc/chatConstants.ts`

### Channel Constants Structure

Follow the existing pattern from other IPC constants files:

```typescript
export const CHAT_CHANNELS = {
  SEND_TO_AGENTS: "chat:sendToAgents",
} as const;

export const CHAT_EVENTS = {
  AGENT_UPDATE: "agent:update",
  ALL_COMPLETE: "all:complete", // optional
} as const;

export type ChatChannel = (typeof CHAT_CHANNELS)[keyof typeof CHAT_CHANNELS];
export type ChatEvent = (typeof CHAT_EVENTS)[keyof typeof CHAT_EVENTS];
```

### Event Payload Type Definitions

Define TypeScript interfaces for event payloads:

```typescript
export interface AgentUpdateEvent {
  conversationAgentId: string;
  status: "thinking" | "complete" | "error";
  messageId?: string; // present on 'complete'
  error?: string; // present on 'error'
}

export interface AllCompleteEvent {
  conversationId: string;
}

export interface SendToAgentsRequest {
  conversationId: string;
  userMessageId: string;
}
```

### Integration with Index

Update `apps/desktop/src/shared/ipc/index.ts` to export the new constants following the established barrel export pattern.

## Acceptance Criteria

**Functional Requirements:**

- ✅ CHAT_CHANNELS constant object with SEND_TO_AGENTS channel
- ✅ CHAT_EVENTS constant object with AGENT_UPDATE and ALL_COMPLETE events
- ✅ TypeScript type definitions for ChatChannel and ChatEvent
- ✅ Interface definitions for AgentUpdateEvent, AllCompleteEvent, SendToAgentsRequest
- ✅ Proper exports in index.ts following established patterns

**Technical Requirements:**

- ✅ Use `as const` assertion for type safety
- ✅ Follow naming conventions: "chat:" prefix for channels, "agent:" for events
- ✅ Include JSDoc documentation for all interfaces
- ✅ Consistent with existing IPC constant file structure and patterns

**Testing Requirements:**

- ✅ Create unit tests in `apps/desktop/src/shared/ipc/__tests__/chatIPC.test.ts`
- ✅ Test channel name constants match expected strings
- ✅ Test type definitions are properly exported and accessible
- ✅ Test event payload interfaces accept valid data structures
- ✅ Test integration with index.ts exports

## Out of Scope

- IPC handler implementation (separate task)
- Preload API exposure (separate task)
- Main process event emission logic (separate task)

## Dependencies

None - this is a foundational task that other tasks will depend on.

## Security Considerations

- Ensure channel names are unique and don't conflict with existing channels
- Event payload interfaces should validate required/optional fields
- No sensitive data should be included in type definitions

## Performance Considerations

- Constants are compile-time values with no runtime performance impact
- Type definitions should be efficiently structured for TypeScript compilation
