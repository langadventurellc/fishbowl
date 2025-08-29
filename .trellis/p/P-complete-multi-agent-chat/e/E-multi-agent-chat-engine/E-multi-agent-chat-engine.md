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
