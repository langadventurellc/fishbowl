---
id: T-integrate-error-handling-into
title: Integrate error handling into ChatOrchestrationService with system
  message persistence
status: open
priority: high
parent: F-multi-agent-error-handling
prerequisites:
  - T-create-structured-chat-error
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-29T23:32:56.201Z
updated: 2025-08-29T23:32:56.201Z
---

# Integrate Error Handling into ChatOrchestrationService with System Message Persistence

## Context

Enhance the existing `ChatOrchestrationService.processAgentMessage` method to use the new structured error classification system and persist error system messages to the conversation. This follows the simplest approach by handling error persistence directly where agent failures occur.

## Technical Approach

Modify `packages/shared/src/services/chat/ChatOrchestrationService.ts` to:

1. Import and use the new ChatError types and ErrorMapper
2. Enhance error handling in the existing try/catch block
3. Persist error system messages using the existing MessageRepository
4. Improve structured logging with ChatError details

## Detailed Implementation Requirements

### ChatOrchestrationService Integration

1. **Import new error types**:

   ```typescript
   import { ChatError, ChatErrorType, ErrorMapper } from "./errors";
   ```

2. **Enhance processAgentMessage method**:
   - Replace existing generic error handling with structured ChatError processing
   - Use ErrorMapper to convert LlmProviderError to ChatError format
   - Add agent name resolution for user-friendly error messages
   - Persist error as system message in conversation chronology

3. **Error System Message Persistence**:

   ```typescript
   // When agent fails, create system message with error
   const errorSystemMessage = await this.messageRepository.create({
     conversation_id: conversationId,
     conversation_agent_id: null, // System message
     role: "system",
     content: `Agent ${agentName}: ${chatError.userMessage}`,
     included: true,
   });
   ```

4. **Improved Error Logging**:
   - Log structured ChatError details for observability
   - Include correlation context: conversationId, agentId, provider
   - Log sanitized technical details without sensitive information
   - Maintain existing performance metrics (duration tracking)

### Agent Name Resolution

Add helper method to resolve agent names for user-friendly error messages:

```typescript
private async resolveAgentName(agentId: string): Promise<string> {
  try {
    const agent = await this.agentsResolver(agentId);
    return agent.name || `Agent ${agentId}`;
  } catch {
    return `Agent ${agentId}`;
  }
}
```

### Enhanced AgentProcessingResult

Update return values to include structured error information:

```typescript
return {
  agentId,
  success: false,
  error: chatError.userMessage, // User-friendly message
  errorDetails: chatError, // Full structured error for logging
  duration,
};
```

## Detailed Acceptance Criteria

### Error Classification and Handling

- ✅ LlmProviderError instances are converted to ChatError using ErrorMapper
- ✅ Error types are properly classified (network, auth, rate limit, etc.)
- ✅ Agent names are resolved and included in error messages
- ✅ Generic Error instances are handled and classified as UNKNOWN_ERROR
- ✅ Error context includes conversationId, agentId, provider, timestamp

### System Message Persistence

- ✅ Error system messages are persisted immediately when agent fails
- ✅ System messages include agent identification: "Agent {name}: {error message}"
- ✅ System messages are marked as included=true for chronological display
- ✅ System messages have null conversation_agent_id (system-generated)
- ✅ Message creation failures are handled gracefully with fallback logging

### Structured Logging Enhancement

- ✅ Error logs include full ChatError structured details
- ✅ Sensitive information is never logged (API keys, tokens, credentials)
- ✅ Log entries include correlation context for debugging
- ✅ Performance metrics are preserved (duration tracking)
- ✅ Log levels are appropriate (error for failures, debug for progress)

### Integration with Existing Patterns

- ✅ Existing processAgentMessage method signature unchanged
- ✅ AgentProcessingResult interface remains compatible
- ✅ Error handling doesn't affect successful agent processing
- ✅ Parallel processing behavior is maintained
- ✅ Fire-and-forget pattern in chatHandlers continues working

## Testing Requirements

Include comprehensive unit tests covering:

- Error classification for different LlmProviderError instances
- System message persistence when agents fail
- Agent name resolution (success and failure scenarios)
- Error logging with proper sanitization
- Integration with existing test scenarios in ChatOrchestrationService.test.ts
- Edge cases: repository failures, malformed errors, missing agent data

## Dependencies

- Requires: T-create-structured-chat-error (ChatError types and ErrorMapper)
- Uses existing: MessageRepository, LlmBridge, SystemPromptFactory
- Integrates with: Current ChatOrchestrationService test suite
- Consumed by: IPC chat handlers and UI error display

## Out of Scope

- IPC event emission changes (handled in separate task)
- UI error state management (handled in separate task)
- Retry mechanisms (handled in separate task)
- Performance optimization beyond existing patterns
