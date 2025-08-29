---
id: P-complete-multi-agent-chat
title: Complete Multi-Agent Chat System Implementation
status: in-progress
priority: medium
prerequisites: []
affectedFiles:
  apps/desktop/src/shared/ipc/messagesConstants.ts:
    Created IPC channel constants
    for messages operations with MESSAGES_CHANNELS object and
    MessagesChannelType union type
  apps/desktop/src/shared/ipc/messages/listRequest.ts:
    Created MessagesListRequest
    interface for retrieving messages by conversationId
  apps/desktop/src/shared/ipc/messages/listResponse.ts: Created MessagesListResponse interface extending IPCResponse<Message[]>
  apps/desktop/src/shared/ipc/messages/createRequest.ts: Created MessagesCreateRequest interface accepting CreateMessageInput
  apps/desktop/src/shared/ipc/messages/createResponse.ts: Created MessagesCreateResponse interface extending IPCResponse<Message>
  apps/desktop/src/shared/ipc/messages/updateInclusionRequest.ts:
    Created MessagesUpdateInclusionRequest interface for updating message
    inclusion flags
  apps/desktop/src/shared/ipc/messages/updateInclusionResponse.ts:
    Created MessagesUpdateInclusionResponse interface extending
    IPCResponse<Message>
  apps/desktop/src/shared/ipc/messages/index.ts: Created barrel file exporting all messages request/response types
  apps/desktop/src/shared/ipc/index.ts: Added messages constants, request types,
    and response types exports to main IPC index
  apps/desktop/src/main/services/MainProcessServices.ts: Added MessageRepository import and initialization with proper error handling
  apps/desktop/src/electron/messagesHandlers.ts: Created new file with
    setupMessagesHandlers function implementing messages:list, messages:create,
    and messages:updateInclusion handlers
  apps/desktop/src/electron/main.ts: Added import for setupMessagesHandlers and
    created setupMessagesIpcHandlers function following established patterns
  apps/desktop/src/electron/preload.ts:
    Extended electronAPI object with messages
    API implementing list, create, and updateInclusion operations following
    established patterns from conversations API
  apps/desktop/src/types/electron.d.ts:
    Added MessagesAPI interface to ElectronAPI
    type definition with proper JSDoc documentation for all three operations
  apps/desktop/src/electron/__tests__/preload.messages.test.ts:
    Created comprehensive unit tests for messages preload API with 24 test cases
    covering success scenarios, error handling, IPC communication failures, and
    contextBridge integration
  apps/desktop/src/hooks/messages/useMessages.ts: Created new useMessages hook
    following useConversations pattern with conversationId parameter, message
    fetching via IPC, proper error handling, and stable chronological sorting
  apps/desktop/src/hooks/messages/index.ts: Created barrel export file for
    messages hooks with proper JSDoc documentation; Updated barrel export file
    to include useCreateMessage hook with documentation examples; Updated barrel
    export file to include useUpdateMessage hook with documentation examples
  apps/desktop/src/hooks/messages/__tests__/useMessages.test.tsx:
    Created comprehensive unit test suite with 18 test scenarios covering all
    hook functionality including success cases, error handling, environment
    detection, refetch operations, sorting behavior, and memory cleanup
  apps/desktop/src/hooks/messages/useCreateMessage.ts: Created new
    useCreateMessage hook with validation, error handling, and IPC integration
    following useCreateConversation pattern
  apps/desktop/src/hooks/messages/__tests__/useCreateMessage.test.tsx:
    Created comprehensive unit test suite with 23 test scenarios covering all
    hook functionality including success cases, validation errors, IPC errors,
    environment detection, and memory cleanup
  apps/desktop/src/hooks/messages/useUpdateMessage.ts: Created new
    useUpdateMessage hook with updateInclusion function, proper error handling,
    environment detection, and state management following established patterns
  apps/desktop/src/hooks/messages/__tests__/useUpdateMessage.test.tsx:
    Created comprehensive unit test suite with 22 test scenarios covering all
    hook functionality including success cases, validation errors, IPC errors,
    environment detection, and concurrent operations
  packages/shared/src/repositories/messages/MessageRepository.ts:
    Updated SQL query in getByConversation() method to include stable ordering
    (ORDER BY created_at ASC, id ASC) and improved query comment for clarity;
    Enhanced handleDatabaseError method with specific constraint violation
    handling for foreign key, unique, and not null constraints. Added imports
    for ConstraintViolationError and DatabaseErrorCode to enable detailed error
    categorization and user-friendly error messages.
  packages/shared/src/repositories/messages/__tests__/MessageRepository.test.ts:
    Updated existing ordering test to expect new query format and added
    comprehensive test case for stable ordering with identical timestamps to
    ensure consistent message display; Expanded unit test coverage with 21 new
    test cases covering foreign key constraint violations, unique constraint
    violations, not null constraints, malformed input handling, concurrent
    update conflicts, large result sets, and comprehensive edge cases. Added
    imports for constraint violation testing infrastructure.
  packages/shared/src/repositories/messages/validateSchema.ts:
    Created comprehensive MessageSchemaValidator class with methods for
    validating table structure, constraints, and indexes. Includes
    EXPECTED_MESSAGES_SCHEMA definition and constraint enforcement testing.
    Features modular design with helper methods to avoid function complexity
    lint issues.
  packages/shared/src/repositories/messages/types/ColumnInfo.ts: Created interface for PRAGMA table_info result structure
  packages/shared/src/repositories/messages/types/SchemaValidationResult.ts:
    Created interface extending ValidationResult for table structure validation
    results
  packages/shared/src/repositories/messages/types/ConstraintValidationResult.ts:
    Created interface extending ValidationResult for foreign key constraint
    validation results
  packages/shared/src/repositories/messages/types/ForeignKeyInfo.ts: Created interface for PRAGMA foreign_key_list result structure
  packages/shared/src/repositories/messages/types/IndexValidationResult.ts: Created interface extending ValidationResult for index validation results
  packages/shared/src/repositories/messages/types/IndexInfo.ts: Created interface for PRAGMA index_list result structure
  packages/shared/src/repositories/messages/types/IndexColumnInfo.ts: Created interface for PRAGMA index_info result structure
  packages/shared/src/repositories/messages/types/index.ts: Created barrel file exporting all schema validation type definitions
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
log: []
schema: v1.0
childrenIds:
  - E-chat-ui-integration
  - E-enhanced-user-experience
  - E-message-system-foundation
  - E-multi-agent-chat-engine
created: 2025-08-29T15:26:19.801Z
updated: 2025-08-29T15:26:19.801Z
---

# Complete Multi-Agent Chat System Implementation

## Executive Summary

Implement a complete chat system that enables users to have conversations with multiple AI agents simultaneously. The system will integrate existing components (agent management, LLM providers, message persistence) with new chat orchestration logic to deliver a functional multi-agent conversation experience.

**Implementation Philosophy**: Start with the minimum viable multi-agent chat functionality (multiple agents responding to messages) and iterate. Multi-agent conversation is the core value proposition and must be in the MVP. This approach ensures we deliver the fundamental feature while avoiding unnecessary complexity.

## Current State

### ✅ Completed Components

- **Agent Management**: Full CRUD operations with enable/disable functionality via AgentPill clicks
- **LLM Providers**: OpenAI and Anthropic provider implementations with factory pattern
- **Message Data Model**: Complete Message interface and MessageRepository with SQLite persistence
- **System Prompts**: SystemPromptFactory with personality and role integration
- **UI Components**: AgentPill (with thinking states), MessageItem, ChatContainerDisplay, MessageHeader, MessageContent
- **Database Schema**: Tables for conversations, conversation_agents, and messages

### 🎯 Missing Implementation

- **Message Hooks**: `useMessages`, `useCreateMessage`, `useUpdateMessage` following existing patterns
- **Chat Store**: Zustand store for transient chat UI state (thinking indicators, sending state)
- **Chat Orchestration Service**: Service layer connecting UI to LLM providers via IPC bridge
- **IPC Bridge Implementation**: Main process bridge for secure LLM provider invocation
- **Messages IPC**: Main-process handlers and preload exposure for messages list/create/updateInclusion operations
- **Component Wiring**: Integration of existing UI components with new state management

## Technical Requirements

### Architecture Principles

- **Phased Implementation**: Start with single-agent chat, then add multi-agent, then polish
- **Leverage Existing Components**: Reuse all existing UI components and hooks
- **Simplicity First**: No concurrency limits, no complex queuing, no premature optimizations
- **Follow Established Patterns**: Use existing hook patterns (`useMessages` like `useConversations`)
- **Immediate Persistence**: MessageRepository calls from main via IPC; no caching or debouncing
- **Clear Store Separation**: Transient UI state in stores, persistent data via repositories
- **Orchestrator in Main**: Implement the concrete ChatOrchestrationService in Electron main; keep only interfaces/ports in shared
- **Single Event Channel**: Use one consolidated `agent:update` IPC event for MVP; split events only if needed later
- **No Global Bus**: MVP "real-time" = refetch-after-write + listen to `agent:update`; avoid generic pub/sub buses

### Execution Boundary & Security

- **Main-Process LLM Calls**: Provider credentials are read from secure storage and used exclusively in the Electron main process.
- **IPC Bridge**: Renderer interacts with a minimal main-process bridge for LLM invocations and receives only redacted results/errors.
- **Shared Interfaces**: Define bridge interfaces in `packages/shared` and inject platform implementations from `apps/desktop/src/main`.
- **Main-Process DB Access**: All message reads/writes occur in main via repositories; renderer uses typed IPC only (no direct DB access in renderer).

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

### Error Persistence Strategy (MVP)

- **Persisted Summary**: Persist a concise, user-safe system message on provider failure (no schema change in Phase 1).
- **Structured Detail in Logs**: Keep `{ provider, statusCode, safeMessage }` in logs; never store raw exceptions or secrets in DB.

### User Experience

- **Timestamps**: All messages display creation timestamps
- **Loading States**: Disable send during processing; allow typing but prevent submission until all agents complete; show per-agent thinking indicators
- **Error Display**: Failed LLM requests show as system messages in chat
- **Simple UI**: No complex threading, notifications, or advanced features
- **No Agents Enabled**: Persist user message and add a system message indicating no agents are enabled; skip LLM calls

## Phased Implementation Approach

### Phase 1: Multi-Agent Chat MVP

**Goal**: Deliver core multi-agent chat functionality

**Scope**:

- Create `useMessages` hook for message fetching
- Create `useCreateMessage` hook for sending messages
- Wire existing `MessageInputDisplay` and `SendButtonDisplay` components
- IPC bridge supporting parallel LLM calls for all enabled agents
- Implement `useChatStore` for agent thinking states
- Display all agent responses in `ChatContainerDisplay`
- Basic thinking indicators on `AgentPill` components
- Simple error display (no retry yet)

**Success Criteria**: Multiple enabled agents respond simultaneously to user messages

### Phase 2: Enhanced UX & Error Handling

**Goal**: Polish the multi-agent experience

**Scope**:

- Manual retry for failed agent messages
- Cancellation when user sends new message or switches conversations
- Improved error messages with agent identification
- Message inclusion/exclusion checkboxes
- Enhanced thinking animations

**Success Criteria**: Polished multi-agent chat with graceful error handling

### Phase 3: Performance & Advanced Features

**Goal**: Optimize for scale and add advanced capabilities

**Scope**:

- Add timeout handling if needed
- Optimize for large message histories (trimming/pagination)
- Performance improvements for many agents (>5)
- Context overflow handling
- Advanced features based on user feedback

**Success Criteria**: Scalable multi-agent chat supporting many agents and long conversations

## Implementation Architecture

### Hook Layer (`apps/desktop/src/hooks/messages/`)

Following existing patterns from `useConversations`, `useConversationAgents`:

- **useMessages**: Fetch messages for a conversation, with real-time updates
  ```typescript
  const { messages, loading, error, refetch } = useMessages(conversationId);
  ```
- **useCreateMessage**: Send a new message (user or system)
  ```typescript
  const { createMessage, sending, error } = useCreateMessage();
  ```
- **useUpdateMessage**: Update message properties (e.g., included flag)
  ```typescript
  const { updateMessage } = useUpdateMessage();
  ```

Implementation notes:

- Hooks call `window.electronAPI.messages.*` (preload) which invokes main-process handlers.
- Sorting: Ensure stable order by `created_at ASC, id ASC` (prefer server-side SQL; otherwise sort in hook).
- Pagination: Phase 1 may fetch all; design hooks to accept optional pagination params for Phase 2/3.
- Real-time: Use simple refetch-after-create/update and subscribe to `agent:update` for per-agent status; avoid a global event bus in MVP.

### State Management (MVP location: `apps/desktop/src/stores/chat/`)

- **useChatStore**: Minimal store for transient UI state only

  ```typescript
  interface ChatStore {
    // Transient UI state
    sendingMessage: boolean;
    agentThinking: Record<string, boolean>; // conversationAgentId -> thinking
    lastError: Record<string, string>; // conversationAgentId -> error

    // Actions (delegate to repositories/services)
    setSending: (sending: boolean) => void;
    setAgentThinking: (agentId: string, thinking: boolean) => void;
    setAgentError: (agentId: string, error: string | null) => void;
    clearAllThinking: () => void;
  }
  ```

- **Key Principle**: Store only holds UI state; all data operations go through repositories
- **Placement**: Keep store in desktop app for MVP (renderer-only state); consider lifting to shared only if/when mobile needs it.

### Service Layer (`packages/shared/src/services/chat/`)

- **ChatOrchestrationService (main)**: Coordinates message flow, simplified for Phase 1; concrete implementation lives in Electron main.
- **Message Context Assembly**: Compose `SystemPromptFactory` + `MessageFormatterService` to build provider-ready context (no new builder class in Phase 1).
- **LlmBridge Interface**: Define in shared (ports only). Electron main resolves `LlmConfig` (via `LlmStorageService`), instantiates provider with `createProvider`, and performs `sendMessage`.

### UI Component Mapping

**Existing Components to Wire Together**:

- **Input Area**:
  - `MessageInputDisplay` - Already exists, needs `useCreateMessage` hook
  - `SendButtonDisplay` - Already exists, needs sending state from `useChatStore`
- **Message Display**:
  - `ChatContainerDisplay` - Already exists, needs `useMessages` hook
  - `MessageItem` - Already exists, works as-is
  - `MessageHeader`, `MessageContent`, `MessageAvatar` - All ready
- **Agent Pills**:
  - `AgentPill` - Already exists, needs thinking state from `useChatStore`
  - `AgentLabelsContainerDisplay` - Already exists, works as-is
- **Layout**:
  - `ConversationLayoutDisplay` - Already exists, works as-is
  - All sidebar components - Already exist, work as-is

### Integration Points

- **Agent Enablement (main)**: Determine enabled conversation agents via `ConversationAgentsRepository` in main (renderer hooks are UI-only).
- **Conversation Store**: Connect with existing conversation management
- **Message Store**: Direct integration with existing MessageRepository
- **IPC Contract**: Renderer calls `sendToAgents(conversationId, userMessageId)`; main returns per-agent completion events via a single `agent:update` channel

## Detailed Acceptance Criteria

### ChatOrchestrationService (Multi-Agent MVP)

- **GIVEN** a user submits a message in an active conversation
- **WHEN** the service processes the message
- **THEN** it should:
  - Save user message to database immediately via MessageRepository
  - Identify ALL enabled conversation agents from `ConversationAgentsRepository` (main), or accept enabled IDs explicitly from the IPC request
  - Build context for each agent using SystemPromptFactory
  - Make parallel LLM calls for all enabled agents (MVP requirement)
  - Update thinking state for each agent via useChatStore
  - Save each agent response to database as it completes
  - Handle partial failures (some agents succeed, others fail)
  - Update UI state for each agent independently

### Message Context Assembly

- **GIVEN** a conversation with message history
- **WHEN** building context for an LLM request
- **THEN** it should:
  - Filter messages where `included: true`
  - Generate system prompt using agent's personality and role via SystemPromptFactory
  - Format messages chronologically with proper role assignments using `MessageFormatterService` (target agent as assistant; other agents prefixed as user content)
  - Return valid LLM provider request format
  - Phase 3: Add message trimming if context gets too large
  - Ensure stable sorting by `created_at ASC, id ASC` when assembling context

### useChatStore (Zustand) - Transient UI State Only

- **GIVEN** chat interactions occur
- **WHEN** UI needs to show temporary states
- **THEN** the store should:
  - Track `sendingMessage` boolean for input disable state
  - Maintain `agentThinking` record for individual agent loading indicators
  - Store `lastError` record for displaying agent-specific errors
  - **NOT store messages** - use `useMessages` hook instead
  - **NOT store conversation data** - use `useConversation` hook instead
  - **NOT store agent data** - use `useConversationAgents` hook instead
  - Provide simple actions: `setSending`, `setAgentThinking`, `setAgentError`

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
  - If no agents are enabled, persist a system message: "No agents are enabled for this conversation" and do not invoke providers

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

### Database Integration (Simplified)

- **GIVEN** any message creation (user, agent, or error)
- **WHEN** the message is generated
- **THEN** it should:
  - Save immediately to SQLite database via MessageRepository
  - Include proper conversation_id and conversation_agent_id references
  - Set appropriate role (user, assistant, system)
  - Default inclusion to true for new messages
  - Phase 1: Simple sequential saves
  - Phase 2: Handle parallel saves if needed
  - Phase 3: Add optimizations only if lock contention occurs

### Non-Goals (MVP)

- Streaming responses
- Generic real-time pub/sub beyond `agent:update`
- Concurrency limits or queuing beyond parallel per-message requests

## Performance Requirements

### Phase 1: Multi-Agent MVP

- **Concurrent Agents**: Support 2-5 agents responding simultaneously
- **Response Time**: Agent responses appear as they complete (not waiting for all)
- **UI Responsiveness**: Input remains responsive during multi-agent processing

### Phase 2: Enhanced UX

- **Error Recovery**: Failed agents can be retried without affecting others
- **Message Updates**: Inclusion checkbox changes update immediately

### Phase 3: Scale & Optimization

- **Many Agents**: Support 5+ agents efficiently
- **Large Conversations**: Handle 100+ messages without degradation
- **Add optimizations based on observed bottlenecks**

## Security Requirements

- **API Keys**: Use existing secure storage for LLM provider credentials (main process only)
- **Input Validation**: Sanitize user input before database storage
- **Error Messages**: Don't expose internal system details in user-facing errors; persist only concise summaries as system messages (see Error Persistence Strategy)
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

### Phase 1: Multi-Agent MVP

```typescript
// Renderer → Main
sendToAgents(conversationId: string, userMessageId: string) → void

// Main → Renderer (MVP simplified single channel)
'agent:update' → { conversationAgentId: string, status: 'thinking' | 'complete' | 'error', messageId?: string, error?: string }
// Optional: emit 'all:complete' → { conversationId: string } after all agents resolve
```

### Alternative (richer events; optional later adoption)

```typescript
'agent:thinking' → { conversationAgentId: string }
'agent:complete' → { conversationAgentId: string, messageId: string }
'agent:error' → { conversationAgentId: string, error: string }
'all:complete' → { conversationId: string }
```

### Messages IPC (Renderer ↔ Main)

```typescript
// Renderer → Main (invoke)
messages.list(conversationId: string) → Promise<Message[]>
messages.create(input: CreateMessageInput) → Promise<Message>
messages.updateInclusion(id: string, included: boolean) → Promise<Message>

// Preload exposure (renderer)
window.electronAPI.messages = { list, create, updateInclusion }
```

### Phase 2: Enhanced Control

```typescript
// Renderer → Main
retryAgent(conversationId: string, conversationAgentId: string, context: Message[])
  → Promise<{ messageId: string } | { error: string }>
```

### Phase 3: Advanced Features

```typescript
// Renderer → Main
cancelAgents(conversationId: string) → void
setAgentTimeout(timeout: number) → void
```

## Testing Plan

### Phase 1: Multi-Agent MVP Tests

- **useMessages hook**: Fetch and display messages from multiple agents
- **useCreateMessage hook**: Trigger multi-agent response flow
- **IPC Bridge**: Parallel LLM calls with event-based updates
- **Multi-agent response**: All enabled agents respond simultaneously
- **Thinking states**: Individual agent thinking indicators
- **Partial failures**: Some agents succeed while others fail
- **End-to-end**: User sends message, multiple agents respond
- **Messages IPC**: Handlers for list/create/updateInclusion return correct data and enforce main/renderer boundary
- **Provider resolution**: Orchestrator resolves `llmConfigId` → `LlmConfig` via `LlmStorageService` and selects correct provider

### Phase 2: Enhanced UX Tests

- **Retry functionality**: Failed agents can be retried individually
- **Message inclusion**: Checkbox toggles affect context building
- **Error display**: Clear agent-specific error messages
- **Cancellation**: New message cancels in-flight requests

### Phase 3: Performance Tests

- **Many agents**: System handles 5+ agents gracefully
- **Large histories**: Performance with 100+ messages
- **Timeout handling**: Long-running requests handled properly

## Logging & Observability

- Use `@fishbowl-ai/shared` logger; emit structured fields: `conversationId`, `conversationAgentId`, `provider`, `durationMs`, `status`
- Log fan-out start, per-agent completion/failure, cancellation, and DB write outcomes
- Avoid logging secrets or raw provider exceptions; log sanitized summaries only

## Risks & Mitigations

### Phase 1: Multi-Agent MVP Risks

- **Multiple agents fail simultaneously**: Each failure handled independently with clear error messages
- **Race conditions in parallel saves**: Message ordering by timestamp + ID
- **Partial failures confuse users**: Clear UI indicators for each agent's status
- **No enabled agents**: Show helpful message instead of silent failure
- **Renderer DB access**: Risk of accidental direct DB calls in renderer → enforce message persistence through main-process IPC only

### Phase 2: Enhanced UX Risks

- **Retry storms**: Limit retry to manual user action
- **Context inconsistency**: Ensure included/excluded state persists correctly

### Phase 3: Performance Risks

- **Many agents overwhelm UI**: Consider virtualization for agent pills
- **Large context slows LLM calls**: Implement trimming strategically
- **SQLite lock contention**: Add queue only if actually observed

**Key Mitigation**: Multi-agent is core functionality in Phase 1, ensuring the primary value proposition works from the start

This project delivers a complete, working chat system using existing infrastructure while maintaining simplicity and avoiding over-engineering. The architecture supports future enhancements while providing immediate value to users.

## Over-Engineering Guardrails (MVP)

- **No new builder class**: Compose existing `SystemPromptFactory` + `MessageFormatterService`; defer a dedicated builder until needed.
- **Consolidated events**: Use a single `agent:update` event for MVP; split into multiple events only if richer progress states are required.
- **Simple store structures**: Prefer plain records over `Map` in Zustand for serializable, predictable updates.
- **Avoid premature queuing/limits**: No concurrency limits or queues unless bottlenecks are observed in profiling.
- **Desktop-only store**: Keep transient chat store in desktop app until there’s a concrete mobile need.

## Database & Ordering Notes

- All message writes and reads are executed in main via repositories (renderer communicates over IPC).
- Ensure stable ordering by `created_at ASC, id ASC` when returning messages to prevent UI jitter.
- Phase 2+: Add pagination parameters to `messages.list` and UI hooks as histories grow.
