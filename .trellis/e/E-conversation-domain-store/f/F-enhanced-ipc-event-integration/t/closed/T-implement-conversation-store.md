---
id: T-implement-conversation-store
title: Implement conversation store event integration with conversationId filtering
status: done
priority: high
parent: F-enhanced-ipc-event-integration
prerequisites:
  - T-update-event-emission-to
  - T-update-preload-type
affectedFiles:
  packages/ui-shared/src/stores/conversation/ConversationStoreState.ts:
    Added eventSubscription state tracking with isSubscribed boolean and
    lastEventTime string for debugging event subscription status and last
    received event timestamp
  packages/ui-shared/src/stores/conversation/ConversationStoreActions.ts:
    Added subscribeToAgentUpdates action interface with AgentUpdateEvent type
    definition for platform-specific event subscription returning cleanup
    function or null
  packages/ui-shared/src/stores/conversation/useConversationStore.ts:
    Implemented comprehensive event subscription logic including
    handleAgentUpdate function with direct conversationId filtering,
    subscribeToAgentUpdates method with desktop platform detection, event
    cleanup in selectConversation method, and proper TypeScript typing for
    electron API
  packages/ui-shared/src/stores/conversation/__tests__/selectors.test.ts:
    Updated createMockState factory function to include eventSubscription state
    field for proper test compatibility with new store state interface
log:
  - Successfully implemented conversation store event integration with
    conversationId filtering. The store now subscribes to enhanced
    AgentUpdateEvents and filters them directly using conversationId,
    eliminating reverse mapping overhead. Added comprehensive race condition
    protection using activeRequestToken validation and proper cleanup when
    conversations change. Event subscription state is tracked for debugging, and
    the implementation follows existing patterns for platform detection and
    error handling.
schema: v1.0
childrenIds: []
created: 2025-09-01T05:44:10.292Z
updated: 2025-09-01T05:44:10.292Z
---

## Purpose

Integrate the enhanced AgentUpdateEvent with conversationId into the conversation domain store to enable direct conversationId filtering, eliminating reverse mapping overhead and improving event handling efficiency.

## Context

The conversation domain store at `packages/ui-shared/src/stores/conversation/useConversationStore.ts` needs to subscribe to AgentUpdateEvents and update activeMessages when events match the activeConversationId. With the new conversationId field, events can be filtered directly without requiring reverse lookup from conversationAgentId.

## Implementation Requirements

### File to Update

- **Location**: `packages/ui-shared/src/stores/conversation/useConversationStore.ts`
- **Integration point**: Store needs event subscription and filtering logic

### Agent Update Event Integration

1. **Event Subscription Setup**:
   - Subscribe to enhanced AgentUpdateEvents in store initialization or through service injection
   - Use existing patterns from the codebase for IPC event handling

2. **Direct ConversationId Filtering**:

   ```typescript
   const handleAgentUpdate = (event: AgentUpdateEvent) => {
     const { activeConversationId, activeRequestToken } = get();

     // Direct filtering using new conversationId field - NO REVERSE MAPPING
     if (event.conversationId !== activeConversationId) {
       return; // Ignore events for inactive conversations
     }

     // Race condition safety using active request token
     if (get().activeRequestToken !== activeRequestToken) {
       return; // Ignore stale events from previous conversation selections
     }

     // Process event for active conversation
     updateActiveMessagesFromEvent(event);
   };
   ```

3. **Event Processing Logic**:
   - Update activeMessages array based on event status and messageId
   - Handle different event statuses: "thinking", "complete", "error"
   - Maintain message state consistency with agent status updates
   - Apply client-side message limits after updates

4. **Race Condition Handling**:
   - Use activeRequestToken for filtering stale events
   - Validate both activeConversationId and activeRequestToken before processing
   - Simple ignore pattern for outdated events (no complex cancellation)

### Integration with Desktop Platform

5. **Desktop Event Subscription**:
   - Integrate with existing window.electronAPI.chat.onAgentUpdate pattern
   - Subscribe to events through the existing preload API
   - Handle cleanup properly when store is destroyed or conversation changes

6. **Service Integration**:
   - Coordinate with ConversationIpcAdapter for consistent state updates
   - Ensure event-driven updates don't conflict with service-driven updates
   - Maintain single source of truth for activeMessages

## Acceptance Criteria

- [ ] Store subscribes to enhanced AgentUpdateEvent with conversationId field
- [ ] Direct conversationId filtering implemented (no reverse mapping from conversationAgentId)
- [ ] Events update activeMessages only when conversationId matches activeConversationId
- [ ] Race condition protection using activeRequestToken validation
- [ ] Event processing handles all agent status types: "thinking", "complete", "error"
- [ ] Client-side message limits applied after event processing
- [ ] Event subscription cleanup handled properly
- [ ] No performance regression from event filtering
- [ ] Integration works seamlessly with existing conversation store actions

## Technical Implementation Details

### Event Processing Pattern

```typescript
const updateActiveMessagesFromEvent = (event: AgentUpdateEvent) => {
  set((state) => {
    let updatedMessages = [...state.activeMessages];

    switch (event.status) {
      case "complete":
        if (event.messageId) {
          // Update or add completed message
          const existingIndex = updatedMessages.findIndex(
            (m) => m.id === event.messageId,
          );
          if (existingIndex !== -1) {
            updatedMessages[existingIndex] = {
              ...updatedMessages[existingIndex] /* update fields */,
            };
          }
        }
        break;
      case "error":
        // Handle agent error state
        break;
      case "thinking":
        // Handle agent thinking state
        break;
    }

    // Apply message limits
    const trimmedMessages = applyMessageLimit(
      updatedMessages,
      state.maximumMessages,
    );

    return {
      ...state,
      activeMessages: trimmedMessages,
    };
  });
};
```

### Desktop Platform Integration

- Use existing `window.electronAPI.chat.onAgentUpdate` API
- Follow established patterns from other desktop event subscriptions
- Handle electron-specific cleanup and lifecycle management

## Out of Scope

- Mobile platform event integration (handled separately when mobile is implemented)
- Optimistic UI updates (not part of v1 according to epic requirements)
- Complex event replay or caching mechanisms
- Changes to existing service methods

## Testing Requirements

- [ ] Enhanced events are received and processed correctly
- [ ] ConversationId filtering works accurately (only processes matching events)
- [ ] Race condition handling prevents stale event processing
- [ ] Event processing updates activeMessages appropriately
- [ ] Message limits applied correctly after event processing
- [ ] Event subscription cleanup prevents memory leaks
- [ ] Integration doesn't break existing store functionality

## Performance Requirements

- [ ] Direct conversationId filtering improves event processing speed vs reverse mapping
- [ ] Event handling doesn't impact UI responsiveness
- [ ] Memory usage for event processing remains controlled
- [ ] No excessive re-renders from event processing

## Dependencies

- Requires: T-update-event-emission-to (events must emit conversationId)
- Requires: T-update-preload-type (preload must handle enhanced events)
- Integration with: F-conversation-domain-store (completed - store implementation available)
