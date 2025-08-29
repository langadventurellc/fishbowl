---
id: E-multi-agent-chat-engine
title: Multi-Agent Chat Engine
status: in-progress
priority: medium
parent: P-complete-multi-agent-chat
prerequisites:
  - E-message-system-foundation
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
  apps/desktop/src/shared/ipc/chat/chatConstants.ts: Created chat channel constants with SEND_TO_AGENTS channel
  apps/desktop/src/shared/ipc/chat/chatEvents.ts: Created chat event constants with AGENT_UPDATE and ALL_COMPLETE events
  apps/desktop/src/shared/ipc/chat/chatChannelType.ts: Created ChatChannel type definition
  apps/desktop/src/shared/ipc/chat/chatEventType.ts: Created ChatEvent type definition
  apps/desktop/src/shared/ipc/chat/agentUpdateEvent.ts: Created AgentUpdateEvent interface for agent status updates
  apps/desktop/src/shared/ipc/chat/allCompleteEvent.ts: Created AllCompleteEvent interface for completion notifications
  apps/desktop/src/shared/ipc/chat/sendToAgentsRequest.ts: Created SendToAgentsRequest interface for chat triggers
  apps/desktop/src/shared/ipc/chat/index.ts: Created barrel export file for chat IPC module
  apps/desktop/src/shared/ipc/index.ts: Updated main index to export chat constants and types
  apps/desktop/src/shared/ipc/__tests__/chatIPC.test.ts: Created comprehensive
    unit tests with 14 test cases covering constants, types, and interfaces
  apps/desktop/src/electron/preload.ts: Extended electronAPI object with chat
    property containing sendToAgents method for triggering multi-agent responses
    and onAgentUpdate method for subscribing to real-time agent status updates.
    Implemented secure contextBridge patterns with proper error handling and
    event listener management.
  apps/desktop/src/types/electron.d.ts: Added chat API interface to ElectronAPI
    with comprehensive JSDoc documentation for sendToAgents and onAgentUpdate
    methods, including proper TypeScript typing for parameters and return
    values.
  apps/desktop/src/electron/__tests__/preload.chat.test.ts:
    Created comprehensive
    unit test suite with 14 test cases covering both chat methods, error
    handling scenarios, security boundaries, and contextBridge integration.
    Tests verify proper IPC invocation, event listener management, and secure
    callback wrapping.
  apps/desktop/src/electron/chatHandlers.ts:
    Created main process IPC handlers for
    chat operations with sendToAgents method, event emission system, input
    validation, error handling, and ChatOrchestrationService integration
  apps/desktop/src/electron/__tests__/chatHandlers.test.ts:
    Created comprehensive
    unit test suite with 13 test cases covering handler registration, input
    validation, service integration, event emission, error handling, and edge
    cases
  apps/desktop/src/electron/main.ts: Added import for setupChatHandlers from
    chatHandlers.js and integrated it into the setupIpcHandlers function
    alongside other service-dependent handlers (conversations,
    conversationAgents, messages). Chat handlers now properly initialize during
    main process startup with access to MainProcessServices.
  packages/ui-shared/src/stores/chat/useChatStore.ts: Created core Zustand store
    for managing transient chat UI states during multi-agent processing with
    actions for setSending, setAgentThinking, setAgentError,
    setProcessingConversation, clearAgentState, clearAllThinking, and
    clearConversationState; Added export keyword to ChatStore interface to make
    it available for barrel export
  packages/ui-shared/src/stores/chat/__tests__/useChatStore.test.ts:
    Created comprehensive unit test suite with 23 test cases covering store
    initialization, all action methods, concurrent state updates, state
    immutability, and edge cases with 100% functionality coverage
  packages/ui-shared/src/stores/chat/index.ts: Created chat store barrel export
    file with JSDoc documentation, exporting useChatStore hook and ChatStore
    type interface
  packages/ui-shared/src/stores/index.ts:
    Added chat store exports to main stores
    index using barrel export pattern (export * from './chat')
  packages/ui-shared/src/stores/chat/__tests__/index.test.ts: Created
    comprehensive barrel export test suite covering hook exports, React
    integration, TypeScript types, store functionality, and import resolution
    with 10 passing test cases
  apps/desktop/src/hooks/chat/useChatEventIntegration.ts:
    Created React hook that
    integrates shared useChatStore with IPC chat events from main process,
    subscribes to agent update events, maps event statuses to store actions
    (thinking/complete/error), handles conversation switching and cleanup
  apps/desktop/src/hooks/chat/__tests__/useChatEventIntegration.test.tsx:
    Created comprehensive unit test suite with 30+ test scenarios covering IPC
    integration, event handling, error conditions, memory management, and
    non-Electron environment degradation
log: []
schema: v1.0
childrenIds:
  - F-chat-orchestration-service
  - F-chat-state-management
  - F-ipc-chat-bridge
  - F-multi-agent-error-handling
created: 2025-08-29T16:34:45.971Z
updated: 2025-08-29T16:34:45.971Z
---

# Multi-Agent Chat Engine

## Purpose and Goals

Implement the core multi-agent chat orchestration that enables multiple AI agents to respond simultaneously to user messages. This epic delivers the primary value proposition of the application.

## Major Components and Deliverables

### Chat Orchestration Service (`packages/shared/src/services/chat/`)

- **ChatOrchestrationService**: Coordinates multi-agent message processing (concrete implementation runs in Electron main; shared only defines interfaces/ports)
- **LLM Bridge Interface**: Secure main-process LLM provider integration
- **Context Assembly**: Builds agent-specific context from conversation history

### Chat State Management (`apps/desktop/src/stores/chat/`)

- **useChatStore**: Zustand store for transient UI states
- **Agent thinking indicators**: Per-agent processing status
- **Error state management**: Agent-specific error handling

### IPC Chat Bridge (`apps/desktop/src/main/handlers/chat/`)

- **Multi-agent coordination**: `sendToAgents` main process handler
- **Real-time updates**: Single consolidated `agent:update` event for agent status notifications (MVP)
- **Parallel processing**: Simultaneous LLM calls for all enabled agents

## Detailed Acceptance Criteria

### ChatOrchestrationService (Multi-Agent Core)

- **GIVEN** a user submits a message in an active conversation
- **WHEN** the service processes the message
- **THEN** it should:
  - Save user message to database immediately via MessageRepository
  - Identify ALL enabled conversation agents from ConversationAgentsRepository
  - Build agent-specific context using SystemPromptFactory + MessageFormatterService
  - Make parallel LLM calls for all enabled agents simultaneously
  - Update per-agent thinking state via IPC events
  - Save each agent response to database as it completes
  - Handle partial failures gracefully (some agents succeed, others fail)
  - Complete processing when all agents finish (success or failure)
  - If no agents are enabled for the conversation, persist a system message explaining that no agents are enabled and skip provider calls

### Context Assembly System

- **GIVEN** a conversation with message history and target agent
- **WHEN** building LLM context for an agent request
- **THEN** it should:
  - Filter messages where `included: true` for context
  - Generate system prompt using agent's personality/role via SystemPromptFactory
  - Format message history with proper role assignments:
    - User messages as "user" role
    - Target agent messages as "assistant" role
    - Other agent messages prefixed as user content with agent identification
  - Return valid request format for specific LLM provider (OpenAI/Anthropic)
  - Handle empty conversations and first messages appropriately
  - Ensure stable message ordering by `created_at ASC, id ASC` when building context

### LLM Bridge Implementation

- **GIVEN** agent LLM requests need processing
- **WHEN** making provider API calls
- **THEN** it should:
  - Resolve agent's `llmConfigId` to `LlmConfig` via LlmStorageService
  - Instantiate correct provider (OpenAI/Anthropic) using createProvider factory
  - Execute `sendMessage` with agent-specific context
  - Handle provider-specific errors and timeouts
  - Return standardized response format across providers
  - Maintain security - never expose credentials to renderer

### useChatStore (Transient UI State)

- **GIVEN** chat interactions require UI feedback
- **WHEN** managing temporary states
- **THEN** it should:
  - Track `sendingMessage` boolean for input disable state
  - Maintain `agentThinking` record mapping conversationAgentId to thinking status
  - Store `lastError` record for agent-specific error display
  - Provide actions: `setSending`, `setAgentThinking`, `setAgentError`, `clearAllThinking`
  - **NOT store persistent data** - delegate to repositories via hooks
  - Support concurrent agent processing with independent state tracking

### IPC Chat Bridge

- **GIVEN** renderer needs to trigger multi-agent responses
- **WHEN** `sendToAgents(conversationId, userMessageId)` is called
- **THEN** it should:
  - Invoke ChatOrchestrationService in main process
  - Emit `agent:update` events for thinking/complete/error states (single consolidated channel)
  - Support event format: `{ conversationAgentId, status: 'thinking'|'complete'|'error', messageId?, error? }`
  - Handle cancellation if user sends new message
  - Provide optional `all:complete` event when all agents finish

### Error Handling and Recovery

- **GIVEN** LLM provider failures occur during processing
- **WHEN** agents encounter errors
- **THEN** it should:
  - Persist concise error summary as system message in conversation
  - Log structured error details: `{ provider, statusCode, safeMessage }`
  - Never log raw exceptions, API keys, or internal details
  - Display user-friendly error in chat chronologically
  - Allow other agents to continue processing normally
  - Support manual retry through normal message flow

### Parallel Processing Coordination

- **GIVEN** multiple agents need to process the same user message
- **WHEN** coordinating simultaneous LLM requests
- **THEN** it should:
  - Launch all agent requests concurrently (not sequentially)
  - Track individual agent progress independently
  - Handle agents completing at different times
  - Update UI incrementally as each agent responds
  - Maintain conversation chronology with proper timestamps

## Technical Considerations

- **Security**: All LLM credentials and API calls restricted to main process
- **Performance**: Parallel agent processing for responsive user experience
- **Reliability**: Graceful handling of partial failures and network issues
- **Simplicity**: No complex queuing or concurrency limits in MVP
- **Observability**: Structured logging for debugging multi-agent flows
- **Non-Goals (MVP)**: No streaming responses; no generic real-time bus beyond `agent:update`

## Dependencies on Other Epics

- **Requires**: E-message-system-foundation (message hooks and IPC)
- **Enables**: E-chat-ui-integration (component wiring and user experience)

## Estimated Scale

- **4-5 Features** covering orchestration, state management, IPC, and error handling
- **Core functionality** that delivers multi-agent chat capability

## User Stories

- As a user, I want to send one message and get responses from multiple AI agents simultaneously
- As a user, I want to see which agents are thinking and which have responded
- As a user, I want clear feedback when individual agents fail without blocking others
- As a user, I want my enabled/disabled agent settings to control which agents respond

## Non-functional Requirements

- **Concurrency**: Support 2-5 agents responding simultaneously without blocking
- **Response Time**: Agent responses appear in UI as they complete (not batched)
- **Error Recovery**: Individual agent failures don't prevent other agents from responding
- **Resource Usage**: Efficient parallel processing without overwhelming system

## Testing and Validation Requirements

- **Multi-agent Flow**: End-to-end test with 3+ agents responding to user message
- **Partial Failures**: Test scenarios where some agents succeed and others fail
- **Context Assembly**: Verify proper message formatting for different providers
- **State Management**: Confirm thinking indicators and error states update correctly
- **IPC Events**: Validate real-time event emission and handling
- **Provider Integration**: Test with both OpenAI and Anthropic providers
