---
id: F-chat-orchestration-service
title: Chat Orchestration Service
status: in-progress
priority: medium
parent: E-multi-agent-chat-engine
prerequisites: []
affectedFiles:
  packages/shared/src/services/chat/interfaces/LlmBridgeInterface.ts:
    Created platform-agnostic LLM provider bridge interface with sendToProvider
    method for agent-specific LLM requests
  packages/shared/src/services/chat/interfaces/index.ts:
    Created barrel export for
    chat service interfaces following established patterns
  packages/shared/src/services/chat/interfaces/__tests__/LlmBridgeInterface.test.ts:
    Created comprehensive unit tests covering interface compliance, type safety,
    dependency injection patterns, and multi-agent orchestration scenarios
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
  packages/shared/src/services/index.ts: Added chat service exports to main
    services index for public API access; Added LLM service exports to main
    services index for desktop app access
  packages/shared/src/services/chat/__tests__/ChatOrchestrationService.test.ts:
    Implemented comprehensive unit test suite covering multi-agent processing,
    parallel coordination, context assembly, and error handling scenarios
  apps/desktop/src/main/services/chat/MainProcessLlmBridge.ts:
    Created main process implementation of LlmBridgeInterface with
    sendToProvider method, configuration resolution, provider instantiation, and
    secure error handling
  apps/desktop/src/main/services/chat/index.ts: Created barrel export for chat services following established patterns
  apps/desktop/src/main/services/chat/__tests__/MainProcessLlmBridge.test.ts:
    Added comprehensive unit tests covering configuration validation, error
    scenarios, and security requirements
  packages/shared/src/services/llm/index.ts: Added factory exports to make createProvider available from shared package
  apps/desktop/src/main/services/chat/MainProcessSystemPromptResolvers.ts:
    Created system prompt resolvers implementation using repository managers to
    resolve roles and personalities by ID with comprehensive error handling and
    structured logging
  apps/desktop/src/main/services/chat/ChatOrchestrationServiceFactory.ts:
    Created factory for dependency injection that instantiates
    ChatOrchestrationService with all required dependencies including
    SystemPromptFactory, MessageFormatterService, MainProcessLlmBridge, and
    agents resolver function
  apps/desktop/src/main/services/MainProcessServices.ts: Integrated
    ChatOrchestrationService into MainProcessServices constructor with proper
    error handling and logging, making it available as a readonly property
  apps/desktop/src/main/services/chat/__tests__/MainProcessSystemPromptResolvers.test.ts:
    Created comprehensive unit tests covering successful resolution, error
    handling, repository failures, and integration scenarios with 100% code
    coverage
  apps/desktop/src/main/services/chat/__tests__/ChatOrchestrationServiceFactory.test.ts:
    Created comprehensive unit tests covering dependency injection, factory
    pattern, error scenarios, and service creation with all edge cases and
    failure modes tested
log: []
schema: v1.0
childrenIds:
  - T-create-mainprocesschatorchestr
  - T-integrate-chat-orchestration
  - T-create-llmbridgeinterface-for
  - T-implement-chatorchestrationser
  - T-implement-main-process
created: 2025-08-29T19:19:13.980Z
updated: 2025-08-29T19:19:13.980Z
---

# Chat Orchestration Service

## Purpose and Functionality

Implement the core multi-agent chat orchestration service that coordinates message processing across multiple AI agents simultaneously. This service runs in the Electron main process and serves as the central coordinator for multi-agent conversations.

## Key Components to Implement

### ChatOrchestrationService (`packages/shared/src/services/chat/ChatOrchestrationService.ts`)

- Core service interface and business logic for multi-agent message processing
- Coordinates parallel LLM provider calls for all enabled agents
- Manages message flow from user input to agent responses
- Handles context assembly for each agent using existing services

### LlmBridgeInterface (`packages/shared/src/services/chat/interfaces/LlmBridgeInterface.ts`)

- Interface definition for secure main-process LLM provider integration
- Abstracts LLM provider operations for dependency injection
- Defines contract for provider resolution and message sending

### Main Process Implementation (`apps/desktop/src/main/services/chat/`)

- Concrete implementation of ChatOrchestrationService for Electron main process
- LLM bridge implementation using existing LlmStorageService and createProvider factory
- Integration with MainProcessServices for dependency injection

## Detailed Acceptance Criteria

### Multi-Agent Message Processing

- **GIVEN** a user submits a message in an active conversation
- **WHEN** the service processes the message via `processUserMessage(conversationId, userMessageId)`
- **THEN** it should:
  - Save user message to database immediately via MessageRepository
  - Query ConversationAgentsRepository to identify ALL enabled agents for the conversation
  - Build agent-specific context using SystemPromptFactory + MessageFormatterService
  - Execute parallel LLM calls for all enabled agents simultaneously (not sequentially)
  - Update per-agent thinking state via IPC events (`agent:update`)
  - Save each agent response to database as it completes
  - Handle partial failures gracefully (some agents succeed, others fail)
  - Complete processing when all agents finish (success or failure)
  - If no agents are enabled, persist a system message explaining this and skip provider calls

### Context Assembly System

- **GIVEN** a conversation with message history and target agent
- **WHEN** building LLM context for an agent request via `buildAgentContext(conversationId, agentId)`
- **THEN** it should:
  - Retrieve messages where `included: true` from MessageRepository
  - Generate system prompt using agent's personality/role via SystemPromptFactory
  - Format message history with proper role assignments using MessageFormatterService:
    - User messages as "user" role
    - Target agent messages as "assistant" role
    - Other agent messages prefixed as user content with agent identification
  - Return valid request format for specific LLM provider (OpenAI/Anthropic)
  - Handle empty conversations and first messages appropriately
  - Ensure stable message ordering by `created_at ASC, id ASC`

### LLM Bridge Implementation

- **GIVEN** agent LLM requests need processing
- **WHEN** making provider API calls via `sendToProvider(agentConfig, context)`
- **THEN** it should:
  - Resolve agent's `llmConfigId` to `LlmConfig` using LlmStorageService
  - Instantiate correct provider (OpenAI/Anthropic) using createProvider factory
  - Execute `sendMessage` with agent-specific context
  - Handle provider-specific errors and timeouts with structured error logging
  - Return standardized response format across providers
  - Maintain security - never expose credentials to renderer process

### Parallel Processing Coordination

- **GIVEN** multiple agents need to process the same user message
- **WHEN** coordinating simultaneous LLM requests
- **THEN** it should:
  - Launch all agent requests concurrently using Promise.allSettled() or similar
  - Track individual agent progress independently
  - Handle agents completing at different times
  - Emit incremental progress updates via IPC events
  - Maintain conversation chronology with proper timestamps
  - Not block on slow agents - each completes independently

## Implementation Guidance

### Technology Approach

- Use dependency injection pattern for LLM bridge (inject platform-specific implementation)
- Follow existing service patterns from AgentRepository and LlmStorageService
- Leverage Promise.allSettled() for parallel agent processing
- Use existing MessageRepository for immediate persistence
- Integrate with existing SystemPromptFactory and MessageFormatterService
- Keep IPC concerns out of the orchestration core. Define a minimal shared `ChatOrchestrationService` interface and emit per-agent status via injected callbacks or an event emitter so the main-process implementation can be reused and unit tested without Electron.

### Error Handling Strategy

- Persist concise error summary as system message in conversation (user-friendly)
- Log structured error details: `{ provider, statusCode, safeMessage, conversationId, agentId }`
- Never log raw exceptions, API keys, or internal details
- Allow other agents to continue processing normally on individual failures
- Support error classification for different failure modes (network, auth, rate limit, etc.)

### Out of Scope (MVP)

- Complex cancellation semantics across multiple in-flight provider calls. If needed, implement a best-effort cancel flag but defer full cooperative cancellation.
- Concurrency queues or limits beyond handling 2–5 agents in parallel.

### Performance Considerations

- Execute agent requests in parallel, not sequentially
- Use efficient database queries with proper indexing
- Handle up to 5 concurrent agent requests without degradation
- Design for extensibility to support more agents in future

## Testing Requirements

### Unit Tests

- Test multi-agent coordination with mock providers
- Verify proper context assembly for different agent configurations
- Test partial failure scenarios (some agents succeed, others fail)
- Validate provider resolution and error handling
- Test parallel processing coordination

### Integration Tests

- End-to-end test with real MessageRepository and provider mocks
- Test with multiple enabled/disabled agent configurations
- Verify IPC event emission timing and content
- Test database persistence during parallel agent responses

## Security Considerations

### Data Protection

- All LLM provider credentials restricted to main process only
- No sensitive data exposed through IPC events
- Input sanitization before database storage
- Structured error logging without exposing internal details

### Access Control

- Service only accessible from main process
- Renderer communicates through secure IPC bridge only
- No direct database access from renderer process

## Performance Requirements

### Response Time

- Individual agent responses appear in UI as they complete (not batched)
- Context assembly completes within 50ms for typical conversations
- Agent request initiation within 100ms of user message submission

### Concurrency

- Support 2-5 agents responding simultaneously without blocking
- Handle up to 100 messages in conversation history efficiently
- Parallel processing without overwhelming system resources

### Resource Usage

- Memory efficient context assembly (no unnecessary data duplication)
- CPU efficient parallel processing (use system threads appropriately)
- Database connection pooling if needed for concurrent writes

## Dependencies

### Internal Dependencies

- MessageRepository (existing - for message persistence)
- ConversationAgentsRepository (existing - for enabled agent lookup)
- SystemPromptFactory (existing - for agent-specific prompts)
- MessageFormatterService (existing - for context formatting)
- LlmStorageService (existing - for provider configuration)
- createProvider factory (existing - for provider instantiation)

### Additional Internal Dependencies (clarified)

- Agents repository (desktop) to resolve agent details by `agent_id` (name, model, `llmConfigId`, role, personality) via `agentsRepositoryManager`.
- SystemPromptResolvers implementation in main process using existing roles and personalities repository managers to back SystemPromptFactory.
- MainProcessServices container to compose and inject repositories, storage, and logger.

### External Dependencies

- OpenAI and Anthropic provider implementations (existing)
- SQLite database for message persistence (existing)
- IPC infrastructure for renderer communication (existing)
