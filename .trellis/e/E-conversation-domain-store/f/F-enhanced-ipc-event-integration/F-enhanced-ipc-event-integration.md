---
id: F-enhanced-ipc-event-integration
title: Enhanced IPC Event Integration
status: in-progress
priority: medium
parent: E-conversation-domain-store
prerequisites:
  - F-conversation-domain-store
affectedFiles:
  apps/desktop/src/shared/ipc/chat/agentUpdateEvent.ts: "Added conversationId:
    string field as first property with JSDoc documentation '/** Unique
    identifier for the conversation */'"
  apps/desktop/src/shared/ipc/__tests__/chatIPC.test.ts: Updated all
    AgentUpdateEvent test instances to include conversationId field with
    appropriate test values
  apps/desktop/src/electron/__tests__/preload.chat.test.ts: Updated
    mockAgentUpdateEvent, mockAgentCompleteEvent, and mockAgentErrorEvent to
    include conversationId field
  apps/desktop/src/electron/chatHandlers.ts:
    Updated agentUpdateEvent creation in
    createEventEmitter to include conversationId from function parameter
  apps/desktop/src/hooks/chat/__tests__/useChatEventIntegration.test.tsx:
    Updated all 10 AgentUpdateEvent instances in test cases to include
    conversationId field with consistent test values
log: []
schema: v1.0
childrenIds:
  - T-add-conversationid-field-to
  - T-implement-conversation-store
  - T-update-event-emission-to
  - T-update-preload-type
  - T-update-renderer-event
created: 2025-09-01T02:21:31.736Z
updated: 2025-09-01T02:21:31.736Z
---

## Purpose

Enhance the existing IPC event system to include conversationId in AgentUpdateEvent and implement direct conversationId filtering in the domain store, eliminating the need for reverse mapping and improving event handling efficiency. Focus only on adding conversationId to existing event structure.

## Key Components

### AgentUpdateEvent Enhancement

- **Current event structure**: `conversationAgentId`, `status`, `messageId?`, `error?`, `agentName?`, `errorType?`, `retryable?`
- **Enhancement**: Add `conversationId` field to existing payload structure
- **YAGNI principle**: Only add conversationId, don't introduce `agentId` or `content` unless specifically needed

### Files to Update

- **Event type**: `apps/desktop/src/shared/ipc/chat/agentUpdateEvent.ts` (add conversationId field)
- **Event emission**: `apps/desktop/src/electron/chatHandlers.ts` (include conversationId in payload)
- **Preload typings**: Update preload type definitions for enhanced event
- **Renderer consumers**: Update event handlers and tests

## Detailed Acceptance Criteria

### Event Structure Enhancement

- [ ] Add `conversationId: string` field to existing AgentUpdateEvent interface
- [ ] Maintain all existing fields: `conversationAgentId`, `status`, `messageId?`, `error?`, `agentName?`, `errorType?`, `retryable?`
- [ ] **Don't add extra fields**: Avoid `agentId` or `content` unless specifically planned for use
- [ ] Ensure backward compatibility during transition

### Current AgentUpdateEvent Structure (Enhanced)

```typescript
interface AgentUpdateEvent {
  conversationId: string; // NEW: Direct conversation identification
  conversationAgentId: string; // EXISTING
  status: AgentStatus; // EXISTING
  messageId?: string; // EXISTING
  error?: string; // EXISTING
  agentName?: string; // EXISTING
  errorType?: string; // EXISTING
  retryable?: boolean; // EXISTING
}
```

### File Updates Required

#### 1. Event Type Definition

- [ ] Update `apps/desktop/src/shared/ipc/chat/agentUpdateEvent.ts`
- [ ] Add `conversationId: string` to interface
- [ ] Maintain existing field structure exactly

#### 2. Event Emission Enhancement

- [ ] Update `apps/desktop/src/electron/chatHandlers.ts`
- [ ] Include conversationId in event payload during emission
- [ ] Use existing conversationId available in chat handler context
- [ ] Maintain existing event emission patterns

#### 3. Preload and Type Updates

- [ ] Update preload type definitions for enhanced AgentUpdateEvent
- [ ] Ensure renderer process receives updated event structure
- [ ] Maintain type safety across IPC boundary

#### 4. Consumer Updates

- [ ] Update renderer event handlers to handle conversationId
- [ ] Update relevant tests for enhanced event structure
- [ ] Ensure existing event processing logic remains intact

### Domain Store Event Integration

- [ ] Store subscribes to enhanced AgentUpdateEvent with conversationId
- [ ] Direct conversationId filtering implemented (eliminate reverse mapping)
- [ ] Events update activeMessages when conversationId matches activeConversationId
- [ ] Event processing uses active request token for race condition safety
- [ ] Coordinate processingConversationId with useChatStore

### Event Processing Pattern

```typescript
// In conversation domain store
const handleAgentUpdate = (event: AgentUpdateEvent) => {
  const { activeConversationId, activeRequestToken } = get();

  // Direct filtering using new conversationId field
  if (event.conversationId !== activeConversationId) {
    return; // Ignore events for inactive conversations
  }

  // Race condition safety
  if (get().activeRequestToken !== activeRequestToken) {
    return; // Ignore stale events
  }

  // Process event for active conversation
  updateActiveMessagesFromEvent(event);
};
```

### Event Emission Enhancement

```typescript
// In apps/desktop/src/electron/chatHandlers.ts
const emitAgentUpdate = (agentUpdate: AgentUpdateData) => {
  const event: AgentUpdateEvent = {
    conversationId: agentUpdate.conversationId, // NEW: Add this field
    conversationAgentId: agentUpdate.conversationAgentId,
    status: agentUpdate.status,
    messageId: agentUpdate.messageId,
    error: agentUpdate.error,
    agentName: agentUpdate.agentName,
    errorType: agentUpdate.errorType,
    retryable: agentUpdate.retryable,
  };

  eventEmitter.emit("agent-update", event);
};
```

### Implementation Guidance

- **Minimal change**: Only add conversationId field, don't restructure existing event
- **Maintain compatibility**: Ensure existing event consumers continue working
- **Direct filtering**: Use conversationId for immediate event relevance checking
- **Performance focus**: Eliminate reverse lookup overhead through direct field access
- **YAGNI compliance**: Don't add fields not explicitly needed

### Testing Requirements

- [ ] Enhanced events emit correctly from main process with conversationId
- [ ] Renderer process receives and processes conversationId field
- [ ] Direct conversationId filtering works accurately
- [ ] Race condition handling prevents stale event processing
- [ ] Backward compatibility maintained during transition
- [ ] Existing event consumers handle enhanced structure properly

### Security Considerations

- [ ] ConversationId field doesn't expose sensitive conversation data beyond existing exposure
- [ ] Event filtering maintains proper conversation isolation
- [ ] No security regression from enhanced event structure

### Performance Requirements

- [ ] Direct conversationId filtering improves event processing speed
- [ ] Eliminated reverse mapping reduces CPU overhead during events
- [ ] Event handling doesn't impact UI responsiveness
- [ ] Memory usage for event processing remains controlled

## Technical Specifications

### ChatStore Coordination

- [ ] Coordinate processingConversationId between conversation store and ChatStore
- [ ] Maintain existing chat state clearing behavior on conversation selection
- [ ] Ensure consistent conversation selection state across stores

## Dependencies

- **Prerequisites**: F-conversation-domain-store (domain store implementation)
- **Integration points**: Existing IPC event system, chatHandlers, useChatStore
- **Type dependencies**: Current AgentUpdateEvent interface, AgentStatus enum
- **File dependencies**: Event definition, emission, preload, and consumer files

## Implementation Notes

- **Incremental enhancement**: Add conversationId field without disrupting existing structure
- **Maintain existing patterns**: Follow current event emission and consumption patterns
- **Focus on performance**: Direct filtering improvement is the primary goal
- **Compatibility first**: Ensure existing functionality continues working during transition
- **Document changes**: Update relevant documentation for enhanced event structure
