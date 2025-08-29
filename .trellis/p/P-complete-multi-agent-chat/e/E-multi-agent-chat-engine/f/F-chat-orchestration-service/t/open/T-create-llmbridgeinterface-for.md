---
id: T-create-llmbridgeinterface-for
title: Create LlmBridgeInterface for main process LLM provider integration
status: open
priority: high
parent: F-chat-orchestration-service
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-29T19:39:40.308Z
updated: 2025-08-29T19:39:40.308Z
---

# Create LlmBridgeInterface for main process LLM provider integration

## Context

Implement the interface that abstracts LLM provider operations for the chat orchestration service. This interface enables dependency injection and secure main-process LLM provider integration following the established platform abstraction pattern used throughout the codebase.

## Technical Approach

Follow the existing platform abstraction pattern seen in:

- `CryptoUtilsInterface` → `NodeCryptoUtils` / `BrowserCryptoUtils`
- `DatabaseBridge` → `NodeDatabaseBridge`
- `FileSystemBridge` → `NodeFileSystemBridge`

## Implementation Requirements

### Interface Definition (`packages/shared/src/services/chat/interfaces/LlmBridgeInterface.ts`)

```typescript
export interface LlmBridgeInterface {
  /**
   * Send message to LLM provider for specific agent
   * @param agentConfig - Agent configuration with llmConfigId
   * @param context - Formatted messages and system prompt for LLM request
   * @returns Promise resolving to agent response content
   */
  sendToProvider(
    agentConfig: { llmConfigId: string },
    context: { systemPrompt: string; messages: FormattedMessage[] },
  ): Promise<string>;
}
```

### Integration Types (`packages/shared/src/services/chat/interfaces/index.ts`)

Export the interface alongside existing shared service interfaces following the pattern in `packages/shared/src/services/llm/interfaces/index.ts`.

## Acceptance Criteria

### Interface Contract

- **GIVEN** an agent configuration and formatted context
- **WHEN** `sendToProvider(agentConfig, context)` is called
- **THEN** it should:
  - Accept `agentConfig` with `llmConfigId` property for provider resolution
  - Accept `context` with `systemPrompt` string and `messages` array
  - Return `Promise<string>` containing the agent's response content
  - Abstract away provider-specific implementation details
  - Support both OpenAI and Anthropic providers transparently

### Error Handling

- **GIVEN** provider resolution or API call failures occur
- **WHEN** calling `sendToProvider`
- **THEN** it should:
  - Throw structured errors that can be caught by orchestration service
  - Provide provider-specific error context for logging
  - Never expose credentials or internal implementation details in error messages

### Type Safety

- **GIVEN** TypeScript compilation and type checking
- **WHEN** implementing or consuming the interface
- **THEN** it should:
  - Provide full type safety for all parameters and return values
  - Use existing shared types (`FormattedMessage` from LLM interfaces)
  - Support proper dependency injection patterns

## Implementation Files

Create these new files:

1. `packages/shared/src/services/chat/interfaces/LlmBridgeInterface.ts` - Interface definition
2. `packages/shared/src/services/chat/interfaces/index.ts` - Barrel export

## Dependencies

### Internal Dependencies

- `FormattedMessage` type from `packages/shared/src/services/llm/interfaces`
- Follow established interface patterns from existing bridge interfaces

### Out of Scope

- Concrete implementation (handled in separate main process task)
- Provider credential management (delegated to implementation)
- Complex error recovery logic (handled by orchestration service)

## Testing Requirements

### Unit Tests (`packages/shared/src/services/chat/interfaces/__tests__/`)

```typescript
describe("LlmBridgeInterface", () => {
  // Interface compliance testing with mock implementation
  it("should define correct method signatures for sendToProvider");
  it("should accept proper parameter types");
  it("should return Promise<string> type");
  it("should support dependency injection patterns");
});
```

## Security Considerations

- Interface design ensures no credentials are passed through shared layer
- Provider resolution handled by implementation, not interface
- Clean separation between business logic and platform-specific provider access

This interface enables the ChatOrchestrationService to remain platform-agnostic while supporting secure LLM provider integration in the Electron main process.
