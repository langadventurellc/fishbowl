---
id: P-complete-multi-agent-chat
title: Complete Multi-Agent Chat System Implementation
status: open
priority: medium
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-29T15:26:19.801Z
updated: 2025-08-29T15:26:19.801Z
---

# Complete Multi-Agent Chat System Implementation

## Executive Summary

Implement a complete chat system that enables users to have conversations with multiple AI agents simultaneously. The system will integrate existing components (agent management, LLM providers, message persistence) with new chat orchestration logic to deliver a functional multi-agent conversation experience.

## Current State

### ✅ Completed Components
- **Agent Management**: Full CRUD operations with enable/disable functionality via AgentPill clicks
- **LLM Providers**: OpenAI and Anthropic provider implementations with factory pattern
- **Message Data Model**: Complete Message interface and MessageRepository with SQLite persistence
- **System Prompts**: SystemPromptFactory with personality and role integration
- **UI Components**: AgentPill (with thinking states), MessageItem, ChatContainerDisplay, MessageHeader, MessageContent
- **Database Schema**: Tables for conversations, conversation_agents, and messages

### 🎯 Missing Implementation
- Chat orchestration service connecting all components
- Message input component for user interaction
- Zustand stores for chat state management
- LLM request context building from message history
- Real-time UI updates during agent processing

## Technical Requirements

### Architecture Principles
- **Simplicity First**: Minimum viable implementation, no over-engineering
- **Immediate Persistence**: All messages saved to SQLite database immediately (no debouncing)
- **No Automatic Retry**: LLM failures display error messages, require manual retry
- **Zustand State Management**: Consistent with existing store patterns in codebase
- **Chronological Display**: Simple message ordering by timestamp, no threading/grouping

### Execution Boundary & Security
- **Main-Process LLM Calls**: Provider credentials are read from secure storage and used exclusively in the Electron main process.
- **IPC Bridge**: Renderer interacts with a minimal main-process bridge for LLM invocations and receives only redacted results/errors.
- **Shared Interfaces**: Define bridge interfaces in `packages/shared` and inject platform implementations from `apps/desktop/src/main`.

### Technology Stack
- **Frontend**: React with TypeScript in Electron renderer process
- **State Management**: Zustand stores following existing `useAgentsStore` patterns
- **Database**: SQLite with immediate persistence via existing MessageRepository
- **LLM Integration**: Existing OpenAI/Anthropic providers via createProvider factory
- **UI Library**: Existing component system with shadcn/ui styling
- **Process Boundary**: LLM providers invoked in main via bridge; renderer subscribes to progress/results.

### Platform Support
- **Desktop**: Electron application (primary focus)
- **Shared Logic**: Business logic in `packages/shared` for future mobile compatibility
- **UI Components**: Platform-specific implementations in `apps/desktop/src`

## Functional Requirements

### Core Chat Flow
1. **Message Input**: User types message in input field and clicks send
2. **Agent Processing**: All enabled conversation agents receive message simultaneously
3. **Parallel LLM Requests**: Each enabled agent makes independent LLM API call
4. **Message Persistence**: User message and all agent responses saved immediately to database
5. **UI Updates**: Messages display chronologically with timestamps
6. **Error Handling**: Failed agent responses show error messages in chat

### Agent Management Integration
- **Enable/Disable**: Existing AgentPill click functionality determines which agents participate
- **Thinking Indicators**: Visual feedback while agents process requests (animated dots)
- **Agent Context**: Each agent receives system prompt with their personality/role configuration

### Message Context Building
- **History Inclusion**: Only messages marked `included: true` sent to LLM providers
- **Context Format**: System prompt + chronological message history formatted per provider requirements
- **User Control**: Existing checkbox UI allows users to exclude specific messages from future context

### User Experience
- **Timestamps**: All messages display creation timestamps
 - **Loading States**: Disable send during processing; allow typing but prevent submission until all agents complete; show per-agent thinking indicators
- **Error Display**: Failed LLM requests show as system messages in chat
- **Simple UI**: No complex threading, notifications, or advanced features
 - **No Agents Enabled**: Persist user message and add a system message indicating no agents are enabled; skip LLM calls

## Implementation Architecture

### Service Layer (`packages/shared/src/services/chat/`)
- **ChatOrchestrationService**: Main business logic coordinating message flow
- **MessageContextBuilder**: Builds LLM request context from conversation history
 - **ProviderBridge Interface**: Defines calls from orchestration to platform bridge (main process) for provider execution and timeout/cancellation
 - **Integration with existing**: MessageRepository, SystemPromptFactory, LLM providers (via main-process bridge)

### State Management (`packages/shared/src/stores/chat/`)
- **useChatStore**: Main Zustand store managing conversations, messages, and UI state
- **Immediate persistence**: Direct MessageRepository calls, no debouncing
- **Simple error handling**: Error states without retry logic
 - **Thinking/Error Maps**: Per-agent thinking flags and last error, keyed by conversation_agent_id

### UI Layer (`apps/desktop/src/components/chat/`)
- **MessageInput**: Text input component with send button and loading states
- **Enhanced existing components**: AgentPill thinking states, message display integration
 - **Manual Retry**: A retry control on failed agent messages to resend using current context to only the failed agent(s)

### Integration Points
- **Agent Store**: Read enabled/disabled state from existing useAgentsStore
- **Conversation Store**: Connect with existing conversation management
- **Message Store**: Direct integration with existing MessageRepository
 - **IPC Contract**: Renderer calls `sendToAgents(conversationId, userMessageId)`; main returns per-agent completion events

## Detailed Acceptance Criteria

### ChatOrchestrationService
- **GIVEN** a user submits a message in an active conversation
- **WHEN** the service processes the message
- **THEN** it should:
  - Save user message to database immediately
  - Identify all enabled conversation agents
  - Build appropriate context for each agent using SystemPromptFactory, trimmed to the last 20 included messages
  - Make LLM provider calls with a concurrency cap (default 3) and per-agent timeout (default 60s)
  - Save each agent response (or error) to database immediately
  - Return success/failure status for UI updates
  - Cancel in-flight requests if a new user message is sent or the conversation changes

### MessageContextBuilder
- **GIVEN** a conversation with message history
- **WHEN** building context for an LLM request
- **THEN** it should:
  - Filter messages where `included: true`
  - Generate system prompt using agent's personality and role via SystemPromptFactory
  - Format messages chronologically with proper role assignments (user/assistant/system)
  - Trim to a configurable limit (default 20 messages) to satisfy provider context constraints
  - Return valid LLM provider request format

### useChatStore (Zustand)
- **GIVEN** chat interactions occur
- **WHEN** state updates are needed
- **THEN** it should:
  - Manage current conversation and message list
  - Track thinking states for individual agents
  - Handle loading states during message processing
  - Store error states without automatic retry logic
  - Update UI optimistically while persisting to database
  - Expose a derived `canSend` state that disables send while agents are processing

### MessageInput Component
- **GIVEN** user wants to send a message
- **WHEN** they interact with the input component
- **THEN** it should:
  - Provide text input field with send button
  - Disable send during message processing; allow typing
  - Show loading indicator while agents are thinking
  - Clear input field after successful send
  - Display validation errors for empty messages
  - Surface a manual retry action on failed agent messages

### Agent Thinking Indicators
- **GIVEN** agents are processing LLM requests
- **WHEN** the UI needs to show progress
- **THEN** it should:
  - Display animated thinking dots on active AgentPills
  - Update thinking state immediately when requests start/complete
  - Show individual agent status (not global loading state)
  - Clear thinking state on timeout or cancellation

### Error Handling
- **GIVEN** LLM provider failures occur
- **WHEN** processing agent responses
- **THEN** it should:
  - Save error message as system message in conversation
  - Display error in chat chronologically with other messages
  - Not attempt automatic retry
  - Allow manual retry through normal message send flow
  - Persist minimal error taxonomy: `{ provider, statusCode, safeMessage }`; redact internal details

### Message Display
- **GIVEN** a conversation with user and agent messages
- **WHEN** displaying the chat interface
- **THEN** it should:
  - Show all messages in chronological order
  - Display timestamps on every message
  - Show user messages right-aligned, agent messages left-aligned
  - Include message inclusion checkboxes for context control
  - Handle system/error messages with distinct styling
  - Stabilize ordering by `created_at` then `id` to prevent jitter

### Database Integration
- **GIVEN** any message creation (user, agent, or error)
- **WHEN** the message is generated
- **THEN** it should:
  - Save immediately to SQLite database via MessageRepository
  - Include proper conversation_id and conversation_agent_id references
  - Set appropriate role (user, assistant, system)
  - Default inclusion to true for new messages
  - Generate proper UUID and ISO timestamp
  - Use transactions or a single-writer queue for parallel saves to avoid write-locks

## Performance Requirements
- **Message Display**: Load and display up to 100 messages without pagination
- **LLM Requests**: Process up to 5 agents per send with a concurrency cap of 3 and per-agent timeout of 60s
- **Database Operations**: Writes should be fast locally; avoid strict SLA and prevent lock contention via transactions/queue
- **UI Responsiveness**: Keep UI interactive; disable send during processing, typing remains responsive

## Security Requirements
- **API Keys**: Use existing secure storage for LLM provider credentials (main process only)
- **Input Validation**: Sanitize user input before database storage
- **Error Messages**: Don't expose internal system details in user-facing errors
 - **IPC Hygiene**: Only pass minimal data across IPC; never transmit secrets to renderer

## Success Metrics
- **Functional**: Users can send messages and receive responses from multiple agents
- **Performance**: Messages appear in UI within 2 seconds of LLM response
- **Reliability**: Message persistence works 100% of the time for local database
- **Usability**: Clear visual feedback for all loading and error states

## Integration Requirements

### Existing Systems
- **Agent Configuration**: Read from useAgentsStore for enabled/disabled state
- **Conversation Management**: Use existing conversation CRUD operations  
- **Message Persistence**: Direct integration with MessageRepository
- **LLM Providers**: Use createProvider factory with existing OpenAI/Anthropic implementations
- **System Prompts**: Use SystemPromptFactory with agent personality/role data

### Future Compatibility
- **Mobile Platform**: Business logic in shared package supports future React Native implementation
- **Additional LLM Providers**: Architecture supports new providers via existing factory pattern
- **Enhanced Features**: Foundation supports future message threading, search, export features
 - **Streaming Responses**: Out of scope for MVP; plan for optional future adoption via provider-specific streams

## Development Approach
- **Incremental Implementation**: Build and test each component independently
- **Existing Pattern Consistency**: Follow established Zustand store and service patterns
- **Simple Solutions**: Choose straightforward implementations over complex architectures
- **Immediate Validation**: Test each feature as it's built before moving to next component

## IPC Contract (Desktop)
- `sendToAgents(conversationId: string, userMessageId: string)` → starts processing for all enabled agents; returns immediately; emits per-agent events
- Events from main to renderer:
  - `agent:started(conversationAgentId)`
  - `agent:succeeded(conversationAgentId, agentMessageId)`
  - `agent:failed(conversationAgentId, errorInfo)`
  - `agents:allComplete(conversationId)`
- Cancellation: `cancelAgents(conversationId)` aborts all in-flight requests for that conversation

## Testing Plan
- **ChatOrchestrationService**: happy path (2 agents), partial failure (1 fails), cancellation on new send, no agents enabled
- **MessageContextBuilder**: inclusion filter, ordering, trimming, provider-specific formatting snapshots (OpenAI vs. Anthropic)
- **Repository Integration**: parallel saves with single-writer/transaction strategy; ordering by `created_at` then `id`
- **IPC Bridge**: mock bridge to verify timeouts, cancellation, and event emission

## Logging & Observability
- Use `@fishbowl-ai/shared` logger; emit structured fields: `conversationId`, `conversationAgentId`, `provider`, `durationMs`, `status`
- Log fan-out start, per-agent completion/failure, cancellation, and DB write outcomes
- Avoid logging secrets or raw provider exceptions; log sanitized summaries only

## Risks & Mitigations
- **Rate Limits**: Concurrency cap and per-agent timeout; surface clear, user-safe error messages
- **SQLite Locks**: Transactions/single-writer queue for parallel saves
- **Context Overflows**: Deterministic trimming to last 20 included messages
- **Security Leakage**: Main-only key usage; minimal IPC payloads; error redaction

This project delivers a complete, working chat system using existing infrastructure while maintaining simplicity and avoiding over-engineering. The architecture supports future enhancements while providing immediate value to users.
