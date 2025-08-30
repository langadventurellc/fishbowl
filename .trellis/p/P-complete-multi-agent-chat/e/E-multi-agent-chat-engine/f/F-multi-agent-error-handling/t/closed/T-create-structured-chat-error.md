---
id: T-create-structured-chat-error
title: Create structured chat error types and classification system
status: done
priority: high
parent: F-multi-agent-error-handling
prerequisites: []
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
log:
  - Implemented comprehensive structured chat error types and classification
    system that extends existing LlmProviderError pattern. Created ChatErrorType
    enum with 7 error categories, ChatError interface with comprehensive error
    context, and ErrorMapper utility class for converting errors to user-safe
    messages. All error types are properly classified with retryable flags,
    user-friendly messages never expose sensitive data, and comprehensive test
    coverage ensures reliability. System integrates seamlessly with existing
    ChatOrchestrationService error handling patterns.
schema: v1.0
childrenIds: []
created: 2025-08-29T23:32:22.745Z
updated: 2025-08-29T23:32:22.745Z
---

# Create Structured Chat Error Types and Classification System

## Context

Implement a comprehensive error classification system for multi-agent chat operations that extends the existing `LlmProviderError` pattern. This system will categorize different failure modes and provide user-friendly error messages without exposing sensitive implementation details.

## Technical Approach

Create error types in `packages/shared/src/services/chat/errors/` following the established pattern from `packages/shared/src/services/llm/errors/LlmProviderError.ts`. This will integrate seamlessly with the existing ChatOrchestrationService error handling in `processAgentMessage` method.

## Detailed Implementation Requirements

### Error Classification Structure

Create the following files and interfaces:

1. **ChatErrorType enum** (`packages/shared/src/services/chat/errors/ChatErrorType.ts`):

   ```typescript
   export enum ChatErrorType {
     NETWORK_ERROR = "network_error",
     AUTH_ERROR = "auth_error",
     RATE_LIMIT_ERROR = "rate_limit_error",
     VALIDATION_ERROR = "validation_error",
     PROVIDER_ERROR = "provider_error",
     TIMEOUT_ERROR = "timeout_error",
     UNKNOWN_ERROR = "unknown_error",
   }
   ```

2. **ChatError interface** (`packages/shared/src/services/chat/errors/ChatError.ts`):

   ```typescript
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

3. **Error mapping utilities** (`packages/shared/src/services/chat/errors/ErrorMapper.ts`):
   - Function to convert `LlmProviderError` instances to `ChatError`
   - Provider-specific error classification logic
   - User-friendly message generation based on error types

4. **Barrel exports** (`packages/shared/src/services/chat/errors/index.ts`)

### Error Message Mapping

Implement consistent, helpful error messages for each error type:

- Network errors: "Unable to connect to AI service. Please check your connection and try again."
- Auth errors: "Authentication failed. Please check your API configuration."
- Rate limit errors: "Too many requests. Please wait a moment before trying again."
- Validation errors: "Invalid request format. Please try again."
- Provider errors: "AI service temporarily unavailable. Please try again."
- Timeout errors: "Request timed out. Please try again."
- Unknown errors: "An unexpected error occurred. Please try again."

Include agent identification in messages: "Agent {agentName}: {errorMessage}"

## Detailed Acceptance Criteria

### Error Classification

- ✅ All error types are properly categorized using ChatErrorType enum
- ✅ Error mapping converts LlmProviderError to structured ChatError format
- ✅ Provider-specific errors (OpenAI, Anthropic) are normalized to common types
- ✅ Error details include context: conversationId, agentId, provider, timestamp
- ✅ Retryable flag is properly set based on error type (auth/validation = false, network/timeout = true)

### Security Requirements

- ✅ User messages never contain API keys, tokens, or sensitive configuration
- ✅ Technical details are separated from user-facing messages
- ✅ No internal file paths or implementation details in user messages
- ✅ Error codes are generic and don't reveal system architecture

### Integration Points

- ✅ Seamlessly integrates with existing `LlmProviderError` from llm service
- ✅ Compatible with current ChatOrchestrationService error handling patterns
- ✅ Types exported through shared package index for use across desktop app
- ✅ Follows established error handling patterns from codebase

## Testing Requirements

Include comprehensive unit tests covering:

- Error classification for all ChatErrorType values
- LlmProviderError conversion to ChatError format
- User message generation for each error type
- Security validation (no sensitive data in user messages)
- Edge cases: undefined/null providers, malformed error messages
- Integration with existing error types

## Dependencies

- Extends existing `LlmProviderError` from `packages/shared/src/services/llm/errors/`
- Will be consumed by ChatOrchestrationService error handling
- Used by subsequent error handling and UI display tasks

## Out of Scope

- UI components (handled in separate task)
- Database persistence logic (handled in separate task)
- IPC event changes (handled in separate task)
- Recovery/retry mechanisms (handled in separate task)
