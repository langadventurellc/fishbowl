---
id: T-update-usechateventintegration
title: Update useChatEventIntegration to handle error events and state management
status: open
priority: medium
parent: F-multi-agent-error-handling
prerequisites:
  - T-enhance-ipc-chat-events-to
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-29T23:34:15.913Z
updated: 2025-08-29T23:34:15.913Z
---

# Update useChatEventIntegration to Handle Error Events and State Management

## Context

Enhance the existing `useChatEventIntegration` hook to properly handle the new structured error events from IPC and update the useChatStore with error state information. This ensures error states are properly managed and persisted in the UI state.

## Technical Approach

Modify `apps/desktop/src/hooks/chat/useChatEventIntegration.ts` to:

1. Handle the enhanced AgentUpdateEvent structure with error details
2. Update useChatStore with structured error information
3. Integrate with existing event handling patterns for thinking/complete states

## Detailed Implementation Requirements

### Event Handling Enhancement

1. **Import enhanced types**:

   ```typescript
   import type { AgentUpdateEvent } from "../../shared/ipc/chat";
   ```

2. **Enhance event handler logic**:
   - Handle error status with structured error information
   - Update useChatStore.setAgentError with rich error context
   - Clear thinking state when error occurs
   - Preserve existing thinking/complete handling

   ```typescript
   const handleAgentUpdate = useCallback(
     (event: AgentUpdateEvent) => {
       switch (event.status) {
         case "thinking":
           setAgentThinking(event.conversationAgentId, true);
           break;
         case "complete":
           setAgentThinking(event.conversationAgentId, false);
           break;
         case "error":
           setAgentThinking(event.conversationAgentId, false);
           setAgentError(event.conversationAgentId, {
             message: event.error || "Unknown error occurred",
             agentName: event.agentName,
             errorType: event.errorType,
             retryable: event.retryable || false,
           });
           break;
       }
     },
     [setAgentThinking, setAgentError],
   );
   ```

### Enhanced useChatStore Integration

3. **Update error state management**:
   - Modify useChatStore to accept structured error information
   - Enhance setAgentError to store rich error context
   - Support error display requirements (agent name, error type, retryable)

### Event Lifecycle Management

4. **Error state cleanup**:
   - Clear error states when new conversations are selected
   - Clear error states when new messages are sent (clearAllThinking)
   - Maintain existing cleanup patterns for memory management

## Detailed Acceptance Criteria

### Error Event Handling

- ✅ Error status events properly update useChatStore with structured error information
- ✅ Agent thinking state is cleared when errors occur
- ✅ Error events include all context: message, agentName, errorType, retryable
- ✅ Error handling doesn't affect thinking/complete event processing
- ✅ Event handler gracefully handles missing optional error fields

### State Management Integration

- ✅ setAgentError stores rich error context for UI consumption
- ✅ Error states persist across component re-renders
- ✅ Multiple agent errors can be stored simultaneously
- ✅ Error state structure supports UI display requirements
- ✅ Conversation switching clears previous error states

### Memory Management

- ✅ Error state cleanup prevents memory leaks
- ✅ Event listeners are properly cleaned up on unmount
- ✅ Conversation switching releases error state references
- ✅ Error states are cleared when agents start thinking again
- ✅ Non-Electron environment gracefully handles missing IPC

### Backward Compatibility

- ✅ Existing thinking/complete event handling unchanged
- ✅ Hook continues working if error fields are undefined
- ✅ Component integration points remain compatible
- ✅ Performance characteristics maintained
- ✅ Error handling is additive to existing functionality

## Testing Requirements

Include comprehensive unit tests covering:

- Error event handling with all error context fields
- useChatStore integration with structured error information
- State cleanup when conversations change or messages are sent
- Memory management and event listener cleanup
- Edge cases: missing error fields, malformed events, rapid event sequences
- Integration with existing useChatEventIntegration test suite
- Non-Electron environment behavior

## Dependencies

- Requires: T-enhance-ipc-chat-events-to (Enhanced AgentUpdateEvent interface)
- Extends: Existing useChatEventIntegration hook functionality
- Integrates with: useChatStore from packages/ui-shared/src/stores/chat/
- Consumed by: Chat UI components for error display

## Out of Scope

- useChatStore modifications (may need minor enhancements)
- UI components that consume error state (handled in separate task)
- Error message formatting beyond storing provided context
- Retry mechanism implementation
