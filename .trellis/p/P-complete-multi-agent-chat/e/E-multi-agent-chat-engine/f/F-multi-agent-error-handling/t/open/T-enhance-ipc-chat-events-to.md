---
id: T-enhance-ipc-chat-events-to
title: Enhance IPC chat events to emit structured error information
status: open
priority: medium
parent: F-multi-agent-error-handling
prerequisites:
  - T-integrate-error-handling-into
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-29T23:33:34.914Z
updated: 2025-08-29T23:33:34.914Z
---

# Enhance IPC Chat Events to Emit Structured Error Information

## Context

Update the IPC chat bridge to emit structured error information when agents fail, enhancing the existing `AgentUpdateEvent` interface and chatHandlers implementation. This enables the UI to display rich error information and properly manage error states.

## Technical Approach

Extend the existing IPC infrastructure in `apps/desktop/src/shared/ipc/chat/` and `apps/desktop/src/electron/chatHandlers.ts` to:

1. Enhance AgentUpdateEvent interface with structured error details
2. Update chatHandlers to emit error events with agent context
3. Modify ChatOrchestrationService to provide callback for IPC event emission

## Detailed Implementation Requirements

### Enhanced AgentUpdateEvent Interface

1. **Update AgentUpdateEvent** (`apps/desktop/src/shared/ipc/chat/agentUpdateEvent.ts`):
   ```typescript
   export interface AgentUpdateEvent {
     /** Unique identifier for the conversation agent */
     conversationAgentId: string;
     /** Current status of the agent */
     status: "thinking" | "complete" | "error";
     /** Message ID when agent completes successfully */
     messageId?: string;
     /** Error message when agent fails (user-friendly) */
     error?: string;
     /** Agent name for error display */
     agentName?: string;
     /** Error type for UI styling/behavior */
     errorType?:
       | "network"
       | "auth"
       | "rate_limit"
       | "validation"
       | "provider"
       | "timeout"
       | "unknown";
     /** Whether error is retryable */
     retryable?: boolean;
   }
   ```

### ChatOrchestrationService Event Emission

2. **Add event emission callback**:
   - Modify processUserMessage to accept optional event emission callback
   - Call callback with agent updates (thinking, complete, error)
   - Include structured error information in error events

   ```typescript
   type AgentEventCallback = (event: {
     conversationAgentId: string;
     status: "thinking" | "complete" | "error";
     messageId?: string;
     error?: string;
     agentName?: string;
     errorType?: string;
     retryable?: boolean;
   }) => void;
   ```

### ChatHandlers Enhancement

3. **Update chatHandlers.ts**:
   - Create event emission callback that formats and sends IPC events
   - Resolve conversationAgentId from agentId during event emission
   - Emit error events with structured error information
   - Maintain existing event emission patterns for thinking/complete states

   ```typescript
   const createEventEmitter = (conversationId: string): AgentEventCallback => {
     return (eventData) => {
       const agentUpdateEvent: AgentUpdateEvent = {
         conversationAgentId: eventData.conversationAgentId,
         status: eventData.status,
         messageId: eventData.messageId,
         error: eventData.error,
         agentName: eventData.agentName,
         errorType: eventData.errorType,
         retryable: eventData.retryable,
       };

       webContents.getAllWebContents().forEach((contents) => {
         if (!contents.isDestroyed()) {
           contents.send(CHAT_EVENTS.AGENT_UPDATE, agentUpdateEvent);
         }
       });
     };
   };
   ```

### Integration with Main Process Services

4. **Update processUserMessageAsync**:
   - Pass event emission callback to ChatOrchestrationService
   - Handle agent ID to conversation agent ID mapping
   - Ensure error events include all required context

## Detailed Acceptance Criteria

### IPC Event Structure

- ✅ AgentUpdateEvent interface includes all error context fields
- ✅ Error events include user-friendly error messages
- ✅ Agent names are resolved and included in error events
- ✅ Error types are mapped to UI-friendly categories
- ✅ Retryable flag is properly set for different error types
- ✅ Backward compatibility with existing event consumers

### Event Emission Logic

- ✅ Error events are emitted immediately when agents fail
- ✅ Events include conversationAgentId (not just agentId)
- ✅ Error event emission doesn't block agent processing
- ✅ Event emission failures are handled gracefully with fallback logging
- ✅ All webContents receive events (multi-window support)

### ChatOrchestrationService Integration

- ✅ Service accepts optional event emission callback
- ✅ Callback is invoked for thinking, complete, and error states
- ✅ Agent context is properly resolved for event emission
- ✅ Event emission doesn't affect service functionality when callback is undefined
- ✅ Parallel processing continues to work with event emission

### Structured Error Information

- ✅ ChatError details are properly mapped to IPC event format
- ✅ Error types are simplified for UI consumption
- ✅ Sensitive information is never included in IPC events
- ✅ Agent identification is consistent between error messages and events
- ✅ Error events provide sufficient context for UI error display

## Testing Requirements

Include comprehensive unit tests covering:

- AgentUpdateEvent interface validation
- Event emission callback functionality
- ChatHandlers error event emission
- ConversationAgentId resolution from agentId
- Event emission error handling and fallback
- Integration with existing chatHandlers test suite
- Backward compatibility with current IPC event consumers

## Dependencies

- Requires: T-integrate-error-handling-into (ChatOrchestrationService error integration)
- Extends: Existing IPC infrastructure in apps/desktop/src/shared/ipc/chat/
- Integrates with: MainProcessServices and chatHandlers
- Consumed by: UI error display components and useChatEventIntegration hook

## Out of Scope

- UI components that consume error events (handled in separate task)
- useChatEventIntegration hook modifications (handled in separate task)
- Error recovery/retry mechanisms (handled in separate task)
- Event persistence or queuing mechanisms
