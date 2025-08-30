---
id: F-multi-agent-error-handling
title: Multi-Agent Error Handling
status: in-progress
priority: medium
parent: E-multi-agent-chat-engine
prerequisites:
  - F-chat-orchestration-service
  - F-chat-state-management
  - F-ipc-chat-bridge
affectedFiles:
  packages/shared/src/services/chat/errors/ChatErrorType.ts:
    "Created enum with 7
    error types for classification: network, auth, rate limit, validation,
    provider, timeout, and unknown errors"
  packages/shared/src/services/chat/errors/ChatError.ts: Created comprehensive
    interface with error type, code, user message, technical details,
    conversation context, agent ID, provider, timestamp, and retryable flag
  packages/shared/src/services/chat/errors/ErrorMapper.ts: Implemented utility
    class with static methods to convert LlmProviderError and generic Error to
    structured ChatError format with user-safe messaging and proper error
    classification
  packages/shared/src/services/chat/errors/index.ts: Created barrel exports for error types, interface, and mapper utility
  packages/shared/src/services/chat/errors/__tests__/ChatErrorType.test.ts:
    Created comprehensive unit tests covering enum values, switch statement
    usage, and naming conventions
  packages/shared/src/services/chat/errors/__tests__/ErrorMapper.test.ts:
    Created extensive unit test suite with 49 tests covering all error
    classifications, security requirements, edge cases, and provider-specific
    error handling
  packages/shared/src/services/chat/ChatOrchestrationService.ts:
    Enhanced error handling in processAgentMessage method with structured
    ChatError classification, agent name resolution helper method, system
    message persistence for errors, and improved structured logging with error
    context
  packages/shared/src/services/chat/__tests__/ChatOrchestrationService.test.ts:
    Added comprehensive test suite covering LlmProviderError handling, generic
    error handling, agent name resolution scenarios, system message persistence,
    and partial failure scenarios with proper mocking setup
log: []
schema: v1.0
childrenIds:
  - T-enhance-ipc-chat-events-to
  - T-enhance-structured-error
  - T-enhance-system-message
  - T-integrate-error-handling-into
  - T-update-usechateventintegration
  - T-create-structured-chat-error
created: 2025-08-29T19:21:47.001Z
updated: 2025-08-29T19:21:47.001Z
---

# Multi-Agent Error Handling

## Purpose and Functionality

Implement comprehensive error handling and recovery mechanisms for multi-agent chat operations. This feature ensures graceful degradation when individual agents fail, provides clear user feedback, and maintains system stability during partial failures.

## Key Components to Implement

### Error Classification System (`packages/shared/src/services/chat/errors/`)

- Structured error types for different failure modes (network, auth, rate limit, validation)
- Error categorization and user-friendly message mapping
- Provider-specific error handling and normalization

### Agent Failure Recovery (`packages/shared/src/services/chat/recovery/`)

- Individual agent failure isolation to prevent cascade failures
- Partial success handling when some agents succeed and others fail
- Error state persistence and recovery coordination

### Error Display Components (`apps/desktop/src/components/chat/error/`)

- Agent-specific error message display in chat
- Error state indicators on AgentPill components
- System message formatting for error conditions

### Error Logging and Observability (`packages/shared/src/services/chat/logging/`)

- Structured error logging with context preservation
- Security-safe error message generation
- Performance and reliability metrics collection

## Detailed Acceptance Criteria

### LLM Provider Error Handling

- **GIVEN** LLM provider failures occur during multi-agent processing
- **WHEN** individual agents encounter errors (network, auth, rate limit, validation)
- **THEN** the system should:
  - Classify error types using structured error taxonomy
  - Generate user-friendly error messages without exposing sensitive details
  - Persist concise error summary as system message in conversation
  - Log detailed error information: `{ provider, statusCode, safeMessage, conversationId, agentId, timestamp }`
  - Never log raw exceptions, API keys, or internal implementation details
  - Continue processing other agents normally (failure isolation)
  - Emit appropriate `agent:update` error events via IPC

### MVP Error Mapping

- **GIVEN** a need to ship a minimal, safe MVP
- **WHEN** implementing error classification and mapping
- **THEN** start by centralizing error mapping in the main-process orchestration layer using existing provider errors (e.g., `LlmProviderError`) and emit user-safe summaries via IPC while persisting concise system messages. A fuller shared taxonomy (`packages/shared/src/services/chat/errors/`) can be introduced incrementally.

### Partial Failure Coordination

- **GIVEN** multiple agents are processing simultaneously and some fail
- **WHEN** coordinating responses from successful and failed agents
- **THEN** the system should:
  - Allow successful agents to complete and persist their responses normally
  - Handle failed agents independently without blocking successful ones
  - Display both successful responses and error messages chronologically in chat
  - Update UI state appropriately for each agent (clear thinking, show error)
  - Provide final completion status indicating partial vs complete success
  - Support retry mechanisms for failed agents without affecting successful ones

### Error Message Generation and Display

- **GIVEN** agent failures need to be communicated to users
- **WHEN** generating error messages for display
- **THEN** the system should:
  - Create user-friendly error messages based on error classification
  - Include agent identification in error messages (which agent failed)
  - Format errors as system messages in conversation chronology
  - Avoid technical jargon or internal implementation details
  - Provide actionable guidance when possible ("Please try again", "Check connection")
  - Maintain consistent error message formatting across different failure types
  - Support error message localization structure for future internationalization

### Error State Management in UI

- **GIVEN** agents encounter various error conditions
- **WHEN** updating UI state to reflect errors
- **THEN** the implementation should:
  - Update AgentPill components with error indicators (red state, error icon)
  - Store agent-specific error messages in useChatStore for display
  - Clear thinking indicators when errors occur
  - Provide visual differentiation between different error types
  - Support error state persistence across UI re-renders
  - Enable error state clearing when new messages are sent

### Structured Error Logging

- **GIVEN** errors occur during multi-agent processing
- **WHEN** logging for debugging and observability
- **THEN** the logging system should:
  - Create structured log entries with consistent schema
  - Include contextual information: conversationId, agentId, provider, operation
  - Log timing information for timeout analysis
  - Categorize errors for automated analysis and alerting
  - Sanitize sensitive information before logging
  - Provide correlation IDs for tracing multi-agent operations
  - Support log aggregation and analysis tools integration

### Recovery and Retry Mechanisms

- **GIVEN** agent failures with potential for recovery
- **WHEN** implementing retry and recovery logic
- **THEN** the system should:
  - Support manual retry through normal message send flow (no automatic retry in MVP)
  - Preserve conversation context for retry attempts
  - Handle retry attempts independently per agent
  - Prevent retry storms through appropriate user interface design
  - Clear previous error states when retry is attempted
  - Maintain audit trail of retry attempts for debugging

## Implementation Guidance

### Error Classification Structure

```typescript
enum ChatErrorType {
  NETWORK_ERROR = "network_error",
  AUTH_ERROR = "auth_error",
  RATE_LIMIT_ERROR = "rate_limit_error",
  VALIDATION_ERROR = "validation_error",
  PROVIDER_ERROR = "provider_error",
  TIMEOUT_ERROR = "timeout_error",
  UNKNOWN_ERROR = "unknown_error",
}

interface ChatError {
  type: ChatErrorType;
  code: string;
  userMessage: string;
  technicalDetails: string;
  conversationId: string;
  agentId: string;
  provider: string;
  timestamp: Date;
  retryable: boolean;
}
```

### Error Message Mapping

- Create consistent, helpful error messages for each error type
- Include context-specific information (agent name, operation type)
- Provide clear next steps for users when appropriate
- Maintain brand voice and tone in error communications

### Security-Safe Logging

- Never log API keys, tokens, or other sensitive data
- Scrub stack traces of internal file paths or implementation details
- Log only sanitized error messages and structured metadata
- Use existing logging infrastructure from `@fishbowl-ai/shared`

## Testing Requirements

### Error Scenario Testing

- Test network failures during agent processing
- Verify authentication errors with invalid credentials
- Test rate limiting scenarios with rapid requests
- Validate timeout handling for slow providers
- Test malformed response handling from providers

### Partial Failure Testing

- Test scenarios where 50% of agents succeed and 50% fail
- Verify proper UI state updates during mixed success/failure
- Test retry functionality after partial failures
- Validate conversation state consistency after errors

### UI Error State Testing

- Test AgentPill error state display and clearing
- Verify error message display in chat chronology
- Test error state persistence across component re-renders
- Validate error indicator accessibility and usability

### Logging and Observability Testing

- Verify structured log output format and content
- Test log sanitization removes sensitive data
- Validate error correlation across multi-agent operations
- Test log aggregation and analysis integration

## Security Considerations

### Information Disclosure Prevention

- Sanitize all error messages before display or logging
- Never expose internal system architecture in error messages
- Scrub sensitive data (keys, tokens, internal IDs) from logs
- Limit error detail level based on user context and permissions

### Error Injection Prevention

- Validate error inputs to prevent malicious error injection
- Sanitize user data before including in error messages
- Prevent error messages from enabling system probing
- Implement proper error message escaping for display

### Audit and Compliance

- Log security-relevant errors for audit purposes
- Maintain error retention policies for compliance requirements
- Support secure log transmission and storage
- Enable security team access to error patterns and trends

## Performance Requirements

### Error Handling Performance

- Error detection and handling within 100ms
- Error message generation within 50ms
- Error state updates reflected in UI within 200ms
- Minimal performance impact during normal operations

### Resource Usage During Errors

- Error handling should not consume excessive memory
- Failed agent cleanup should be efficient and complete
- Error logging should not impact application performance
- Recovery mechanisms should not create resource leaks

### Scalability Under Error Conditions

- System remains stable with high error rates
- Error handling scales with number of concurrent agents
- Error reporting does not overwhelm logging infrastructure
- Graceful degradation when error handling systems are stressed

## Dependencies

### Internal Dependencies

- ChatOrchestrationService (for error detection and handling)
- useChatStore (for error state management)
- MessageRepository (for error message persistence)
- Existing logging infrastructure from `@fishbowl-ai/shared`
- IPC infrastructure for error event emission
- IPC Chat Bridge (for `agent:update` error events and preload subscription)

### Component Dependencies

- AgentPill components (for error state display)
- MessageItem components (for error message formatting)
- System message display components
- Chat container components (for error chronology)

### Service Dependencies

- LLM provider implementations (for provider-specific error handling)
- createProvider factory (for error normalization)
- SystemPromptFactory and MessageFormatterService (for error context)
