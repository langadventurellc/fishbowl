---
id: T-implement-main-process
title: Implement main process LlmBridge using existing LlmStorageService
status: done
priority: high
parent: F-chat-orchestration-service
prerequisites:
  - T-create-llmbridgeinterface-for
affectedFiles:
  apps/desktop/src/main/services/chat/MainProcessLlmBridge.ts:
    Created main process implementation of LlmBridgeInterface with
    sendToProvider method, configuration resolution, provider instantiation, and
    secure error handling
  apps/desktop/src/main/services/chat/index.ts: Created barrel export for chat services following established patterns
  apps/desktop/src/main/services/chat/__tests__/MainProcessLlmBridge.test.ts:
    Added comprehensive unit tests covering configuration validation, error
    scenarios, and security requirements
  packages/shared/src/services/llm/index.ts: Added factory exports to make createProvider available from shared package
  packages/shared/src/services/index.ts: Added LLM service exports to main services index for desktop app access
log:
  - Implemented MainProcessLlmBridge class that provides secure LLM provider
    access for the Electron main process. The implementation uses existing
    LlmStorageService to resolve agent configurations, creates provider
    instances via createProvider factory, and handles all error scenarios with
    structured logging. Added comprehensive unit tests covering configuration
    validation, error handling, and security (no sensitive data in logs). Fixed
    shared package exports to make LLM interfaces and factory functions
    available.
schema: v1.0
childrenIds: []
created: 2025-08-29T19:41:01.163Z
updated: 2025-08-29T19:41:01.163Z
---

# Implement main process LlmBridge using existing LlmStorageService

## Context

Create the concrete implementation of LlmBridgeInterface for the Electron main process. This implementation leverages the existing `LlmStorageService` and `createProvider` factory to provide secure LLM provider access following the established platform abstraction pattern.

## Technical Approach

Follow the platform implementation pattern:

- Concrete implementation in main process directory (`apps/desktop/src/main/services/chat/`)
- Use existing `LlmStorageService.getInstance()` for provider configuration
- Use existing `createProvider()` factory for provider instantiation
- Follow error handling patterns from existing main process services

## Implementation Requirements

### Main Process LlmBridge (`apps/desktop/src/main/services/chat/MainProcessLlmBridge.ts`)

```typescript
export class MainProcessLlmBridge implements LlmBridgeInterface {
  private readonly logger = createLoggerSync({
    context: { metadata: { component: "MainProcessLlmBridge" } },
  });

  constructor(
    private readonly llmStorageService: LlmStorageService = LlmStorageService.getInstance(),
  ) {}

  async sendToProvider(
    agentConfig: { llmConfigId: string },
    context: { systemPrompt: string; messages: FormattedMessage[] },
  ): Promise<string>;
}
```

### Service Integration (`apps/desktop/src/main/services/chat/index.ts`)

Export bridge implementation for use in MainProcessServices.

## Acceptance Criteria

### LLM Provider Integration

- **GIVEN** agent LLM requests need processing
- **WHEN** `sendToProvider(agentConfig, context)` is called
- **THEN** it should:
  - Resolve agent's `llmConfigId` to `LlmConfig` using `LlmStorageService.getCompleteConfiguration()`
  - Validate that LLM configuration exists and has required fields
  - Instantiate correct provider (OpenAI/Anthropic) using `createProvider(config.provider)`
  - Execute `provider.sendMessage()` with properly formatted `LlmRequestParams`
  - Extract content from `LlmResponse` and return as string
  - Handle provider-specific errors and timeouts with structured error logging
  - Maintain security - never expose credentials to shared layer

### Request Formatting

- **GIVEN** context with system prompt and formatted messages
- **WHEN** preparing `LlmRequestParams` for provider
- **THEN** it should:
  - Build valid `LlmRequestParams` structure with `apiKey`, `model`, `messages`
  - Include system prompt as first system message or in appropriate provider format
  - Include conversation messages in correct order and format
  - Use agent's configured model from resolved LLM config
  - Handle both OpenAI and Anthropic message format requirements

### Error Handling and Security

- **GIVEN** provider failures or configuration issues
- **WHEN** processing requests
- **THEN** it should:
  - Log structured error details: `{ provider, statusCode, safeMessage, llmConfigId }`
  - Never log raw exceptions, API keys, or sensitive configuration
  - Throw descriptive errors that orchestration service can handle
  - Support error classification for network, auth, rate limit, and validation errors
  - Maintain audit trail of provider interactions without exposing secrets

## Implementation Files

Create these new files:

1. `apps/desktop/src/main/services/chat/MainProcessLlmBridge.ts` - Concrete implementation
2. `apps/desktop/src/main/services/chat/index.ts` - Barrel exports

## Dependencies

### Internal Dependencies

- `LlmBridgeInterface` (from prerequisite task)
- `LlmStorageService` (existing - singleton instance)
- `createProvider` function (existing - from shared LLM factory)
- `LlmConfig`, `FormattedMessage` types (existing - from shared types)
- `LlmRequestParams`, `LlmProvider` interfaces (existing - from shared LLM interfaces)

### Platform-Specific Dependencies

- Electron app context for secure storage access
- Node.js runtime for provider instantiation

## Testing Requirements

### Unit Tests (`apps/desktop/src/main/services/chat/__tests__/MainProcessLlmBridge.test.ts`)

```typescript
describe("MainProcessLlmBridge", () => {
  describe("sendToProvider", () => {
    it("should resolve llmConfigId and create correct provider");
    it("should format context into valid LlmRequestParams");
    it("should handle OpenAI and Anthropic providers correctly");
    it("should extract content from provider response");
    it("should handle provider configuration not found");
    it("should handle provider API failures with structured logging");
    it("should never log sensitive configuration data");
  });

  describe("error handling", () => {
    it("should handle network failures gracefully");
    it("should handle authentication errors");
    it("should handle rate limiting errors");
    it("should handle malformed provider responses");
  });
});
```

### Testing Strategy

- Mock `LlmStorageService` for configuration resolution testing
- Mock `createProvider` factory for provider instantiation testing
- Mock provider instances for API call simulation
- Test both success and failure scenarios for each provider type
- Verify structured logging without sensitive data exposure

## Performance Requirements

- Provider resolution and instantiation within 50ms
- Support concurrent provider calls without resource contention
- Efficient context formatting without unnecessary data transformation
- Proper resource cleanup for provider instances

## Security Considerations

### Data Protection

- All LLM provider credentials restricted to main process only
- No sensitive data exposed through error messages or logs
- Secure provider configuration resolution using existing patterns

### Access Control

- Bridge only accessible from main process services
- No direct access from renderer process or shared layer
- Proper validation of agent configuration inputs

This implementation provides the secure foundation for multi-agent LLM provider access while maintaining clean architectural boundaries.
