---
id: T-implement-chatorchestrationser
title: Implement ChatOrchestrationService with multi-agent coordination
status: done
priority: high
parent: F-chat-orchestration-service
prerequisites:
  - T-create-llmbridgeinterface-for
affectedFiles:
  packages/shared/src/repositories/conversationAgents/ConversationAgentsRepository.ts:
    Added getEnabledByConversationId method to filter and retrieve only enabled
    agents for a conversation, required for ChatOrchestrationService
  packages/shared/src/services/chat/types/AgentContext.ts: Created AgentContext
    interface defining structure for agent-specific context with system prompt
    and formatted messages
  packages/shared/src/services/chat/types/AgentProcessingResult.ts:
    Created AgentProcessingResult interface for individual agent processing
    results including success/failure status and performance metrics
  packages/shared/src/services/chat/types/ProcessingResult.ts:
    Created ProcessingResult interface for overall multi-agent processing
    results with summary statistics and detailed agent results
  packages/shared/src/services/chat/types/index.ts:
    Created barrel exports for all
    chat service types following established patterns
  packages/shared/src/services/chat/ChatOrchestrationService.ts:
    Implemented core ChatOrchestrationService class with parallel agent
    coordination, context assembly, LLM provider integration, and response
    persistence using dependency injection pattern
  packages/shared/src/services/chat/index.ts: Created barrel exports for chat
    service following established service export patterns
  packages/shared/src/services/index.ts: Added chat service exports to main services index for public API access
  packages/shared/src/services/chat/__tests__/ChatOrchestrationService.test.ts:
    Implemented comprehensive unit test suite covering multi-agent processing,
    parallel coordination, context assembly, and error handling scenarios
log:
  - Implemented ChatOrchestrationService with multi-agent coordination
    capabilities. The service coordinates parallel message processing across
    multiple AI agents simultaneously, handles context assembly for each agent,
    and manages response persistence. Added the missing
    getEnabledByConversationId method to ConversationAgentsRepository. All
    acceptance criteria met including parallel processing coordination, context
    assembly system, error handling strategy, and comprehensive test coverage.
    All quality checks pass (lint, format, type-check, unit tests).
schema: v1.0
childrenIds: []
created: 2025-08-29T19:40:25.154Z
updated: 2025-08-29T19:40:25.154Z
---

# Implement ChatOrchestrationService with multi-agent coordination

## Context

Create the core business logic service that coordinates message processing across multiple AI agents simultaneously. This service runs in the shared package and uses dependency injection for platform-specific concerns, following the established service patterns from existing repositories like `ConversationsRepository` and `MessageRepository`.

## Technical Approach

Follow the established service patterns:

- Use dependency injection for platform-specific dependencies (LlmBridgeInterface, repositories)
- Use structured logging with component metadata
- Use Promise.allSettled() for parallel agent processing
- Follow error handling patterns from existing services

## Implementation Requirements

### Core Service (`packages/shared/src/services/chat/ChatOrchestrationService.ts`)

```typescript
export class ChatOrchestrationService {
  private readonly logger = createLoggerSync({
    context: { metadata: { component: "ChatOrchestrationService" } },
  });

  constructor(
    private readonly llmBridge: LlmBridgeInterface,
    private readonly messageRepository: MessageRepository,
    private readonly conversationAgentsRepository: ConversationAgentsRepository,
    private readonly systemPromptFactory: SystemPromptFactory,
    private readonly messageFormatterService: MessageFormatterService,
    private readonly agentsResolver: (
      agentId: string,
    ) => Promise<PersistedAgentData>,
  ) {}

  async processUserMessage(
    conversationId: string,
    userMessageId: string,
  ): Promise<ProcessingResult>;

  async buildAgentContext(
    conversationId: string,
    agentId: string,
  ): Promise<AgentContext>;
}
```

### Service Integration (`packages/shared/src/services/chat/index.ts`)

Export service class for use by main process implementations following patterns from existing service exports.

## Acceptance Criteria

### Multi-Agent Message Processing

- **GIVEN** a user submits a message in an active conversation
- **WHEN** `processUserMessage(conversationId, userMessageId)` is called
- **THEN** it should:
  - Query `ConversationAgentsRepository.getEnabledByConversationId()` to find all enabled agents
  - Build agent-specific context for each enabled agent using `buildAgentContext()`
  - Launch parallel LLM calls using `Promise.allSettled()` with `llmBridge.sendToProvider()`
  - Save each agent response to database via `MessageRepository.create()` as it completes
  - Return processing results with success/failure status for each agent
  - Handle case where no agents are enabled (return early with appropriate status)
  - Maintain proper error isolation (one agent failure doesn't affect others)

### Context Assembly System

- **GIVEN** a conversation with message history and target agent
- **WHEN** `buildAgentContext(conversationId, agentId)` is called
- **THEN** it should:
  - Retrieve messages where `included: true` using `MessageRepository.listByConversationId()`
  - Resolve agent details using injected `agentsResolver` function
  - Generate system prompt using `SystemPromptFactory.createSystemPrompt()`
  - Format message history using `MessageFormatterService.formatMessages()`:
    - User messages as "user" role
    - Target agent messages as "assistant" role
    - Other agent messages prefixed as user content with agent identification
  - Return valid `AgentContext` with system prompt and formatted messages
  - Ensure stable message ordering by `created_at ASC, id ASC`

### Parallel Processing Coordination

- **GIVEN** multiple agents need to process the same user message
- **WHEN** coordinating simultaneous LLM requests
- **THEN** it should:
  - Launch all agent requests concurrently using `Promise.allSettled()`
  - Track individual agent progress independently
  - Handle agents completing at different times gracefully
  - Provide detailed results for each agent (success, failure, timing)
  - Not block on slow agents - each completes independently
  - Maintain conversation chronology with proper timestamps

### Error Handling Strategy

- **GIVEN** LLM provider failures occur during processing
- **WHEN** agents encounter errors
- **THEN** it should:
  - Log structured error details: `{ provider, agentId, conversationId, error }`
  - Never log raw exceptions, API keys, or internal details
  - Allow other agents to continue processing normally on individual failures
  - Return structured error information for each failed agent
  - Support error classification for different failure modes

## Implementation Files

Create these new files:

1. `packages/shared/src/services/chat/ChatOrchestrationService.ts` - Core service class
2. `packages/shared/src/services/chat/types/` - Supporting types (ProcessingResult, AgentContext)
3. `packages/shared/src/services/chat/index.ts` - Barrel exports

## Dependencies

### Internal Dependencies

- `LlmBridgeInterface` (from prerequisite task)
- `MessageRepository` (existing - constructor injection)
- `ConversationAgentsRepository` (existing - constructor injection)
- `SystemPromptFactory` (existing - constructor injection)
- `MessageFormatterService` (existing - constructor injection)
- `PersistedAgentData` type (existing - for agent resolution)

### Injected Dependencies

- `agentsResolver: (agentId: string) => Promise<PersistedAgentData>` - Function to resolve agent details by ID

## Testing Requirements

### Unit Tests (`packages/shared/src/services/chat/__tests__/ChatOrchestrationService.test.ts`)

```typescript
describe("ChatOrchestrationService", () => {
  describe("processUserMessage", () => {
    it("should process multiple enabled agents in parallel");
    it("should handle partial failures gracefully");
    it("should return early when no agents enabled");
    it("should save agent responses with correct timestamps");
    it("should log structured errors without sensitive data");
  });

  describe("buildAgentContext", () => {
    it("should build valid context with system prompt and formatted messages");
    it("should handle agents with different roles and personalities");
    it("should maintain stable message ordering");
    it("should include only messages where included=true");
  });

  describe("parallel processing", () => {
    it("should coordinate 3+ agents simultaneously");
    it("should not block on slow agents");
    it("should provide per-agent results");
  });
});
```

### Testing Strategy

- Mock all injected dependencies for isolated unit testing
- Test with 2-5 mock agents for parallel processing verification
- Use mock LlmBridge that can simulate success/failure scenarios
- Verify proper repository interaction patterns
- Test context assembly with various message history scenarios

## Performance Requirements

- Context assembly completes within 50ms for conversations with <100 messages
- Agent request initiation within 100ms of method call
- Support 2-5 agents responding simultaneously without blocking
- Memory efficient context assembly (no unnecessary data duplication)

## Out of Scope (MVP)

- Complex cancellation semantics across multiple in-flight provider calls
- Concurrency queues or limits beyond handling 2–5 agents in parallel
- Streaming responses (future enhancement)
- Real-time progress events (handled by IPC layer)
