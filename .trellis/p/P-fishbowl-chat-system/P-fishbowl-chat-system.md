---
id: P-fishbowl-chat-system
title: Fishbowl Chat System Implementation
status: open
priority: medium
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-27T02:08:21.833Z
updated: 2025-08-27T02:08:21.833Z
---

# Fishbowl Chat System Implementation

## Executive Summary

Implement the core chat functionality for the Fishbowl application - a desktop (only) platform that enables conversations between users and multiple AI agents simultaneously. The chat system is the central feature that brings together all the existing configuration capabilities (agents, roles, personalities, LLM providers) into a functional multi-agent conversation interface.

## Project Overview

### Current State

The application already has:

- Complete configuration system for agents, roles, and personalities
- LLM provider configuration UI (OpenAI and Anthropic)
- Database tables for conversations and conversation_agents
- Basic UI layout with ChatContainerDisplay component
- Repository pattern for data access
- Platform abstraction patterns for cross-platform support

### What This Project Delivers

- Full chat messaging functionality with multi-agent support
- Message persistence in SQLite database
- LLM provider integration (OpenAI, Anthropic, with mock for testing)
- Interactive UI for sending messages and managing agent responses
- Message inclusion/exclusion mechanism via checkboxes

## Detailed Functional Requirements

### 1. Message Management

- **Create and Store Messages**: Users can send messages that are stored in a local SQLite database
- **Message Display**: Show all messages in chronological order (ordered by created_at timestamp)
- **Agent Responses**: Display responses from multiple agents in parallel
- **Message Attribution**: Clear visual indication of who sent each message (user or specific agent)
- **Message Length**: Maximum 5000 characters per message

### 2. Multi-Agent Chat Flow

- **Parallel Processing**: When a user sends a message, all enabled conversation agents receive it simultaneously
- **Independent Responses**: Each agent processes messages through their configured LLM provider independently
- **Response Management**: Users see all agent responses as they arrive

### 3. Message Inclusion Control

- **Checkbox Interface**: Each agent response has a checkbox to include/exclude it from future context
- **Persistent State**: Checkbox states are preserved in the database `included` field
- **Retroactive Control**: Users can modify inclusion state of any previous message in the conversation
- **Context Building**: Only messages marked as `included=true` are sent in future LLM requests

### 4. Conversation Agent Management

- **Agent Pills UI**: Visual representation of agents in the conversation (above chat area)
- **Enable/Disable**: Click agents to toggle their participation (stored as `enabled` field)
- **Add/Remove**: Dynamically add or remove agents from a conversation
- **State Persistence**: Agent states persist across sessions
- **Solo Mode**: Users can send messages with all agents disabled (talking to themselves)

## Technical Requirements

### 1. Database Schema

#### Conversation Agents Table Update

```sql
-- Migration to update existing conversation_agents table
ALTER TABLE conversation_agents
ADD COLUMN enabled BOOLEAN DEFAULT 1;
```

#### Messages Table

```sql
CREATE TABLE messages (
    id TEXT PRIMARY KEY,                    -- UUID
    conversation_id TEXT NOT NULL,          -- FK to conversations
    conversation_agent_id TEXT,             -- NULL for user messages, references configured agent ID from settings for agent messages
    role TEXT NOT NULL,                    -- 'user' | 'assistant' | 'system'
    content TEXT NOT NULL,                 -- Message text content (max 5000 characters)
    included BOOLEAN DEFAULT 1,            -- Whether to include in future LLM context (system messages always excluded)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    FOREIGN KEY (conversation_agent_id) REFERENCES conversation_agents(id) ON DELETE SET NULL
);

CREATE INDEX idx_messages_conversation_order
ON messages(conversation_id, created_at);
```

### 2. Type Definitions

#### Core Message Types

- `Message` schema with Zod validation
- `CreateMessageInput` and `UpdateMessageInput` types
- `MessageRole` enum: 'user' | 'assistant' | 'system'
- Content validation: max 5000 characters (for user messages only)
- System messages are stored but excluded from LLM context

### 3. Service Architecture

#### Repository Layer (Shared Package)

- `MessageRepository` implementing CRUD operations
- Follows existing pattern from `ConversationsRepository`

#### Service Layer (Shared Package)

- `ChatService`: Orchestrates message flow, agent coordination
- `LlmProviderService`: Manages provider instances and routing

#### LLM Provider Integration

- `LlmProvider` interface in shared package
- Implementations: `OpenAIProvider`, `AnthropicProvider`, `MockProvider`
- No platform-specific bridge pattern needed (uses universal fetch API)

### 4. State Management

- **Zustand Stores**: Migrate from React Context to Zustand for all state
- `useChatStore`: Manages current conversation messages and UI state
- `useAgentStore`: Manages conversation agents and their states
- Refactor existing `ServicesContext` to use Zustand

### 5. UI Components

#### Desktop Components

- `MessageList`: Displays all messages with proper attribution
- `MessageInput`: Text input with send button
- `AgentMessage`: Individual message component with checkbox
- `AgentPills`: Agent management UI above chat area

#### Component Features

- Real-time message updates as agents respond
- Loading states for pending agent responses
- Error handling for failed LLM requests
- Checkbox persistence and state management

## Implementation Approach

### Phase 1: Data Foundation

- Create messages table migration
- Define message TypeScript schemas with Zod
- Implement MessageRepository with full CRUD operations
- Add message-related types to shared package

### Phase 2: LLM Provider Abstraction

- Define LlmProvider interface
- Create MockProvider for testing (returns predetermined responses)
- Implement provider factory/registry pattern
- Add provider configuration validation

### Phase 3: Basic Chat Flow

- Create ChatService for message orchestration
- Implement Zustand stores for chat state
- Build basic message display components
- Create message input component
- Wire up end-to-end flow with MockProvider

### Phase 4: Multi-Agent Features

- Implement parallel agent request handling
- Add message attribution metadata
- Create checkbox UI for inclusion control
- Implement context building logic (filtering by `included` field)
- Add agent enable/disable functionality

### Phase 5: Production Providers

- Implement OpenAIProvider with proper API integration
- Implement AnthropicProvider with proper API integration
- Add provider-specific error handling
- Implement retry logic and rate limiting

## Architecture Principles

### Simplicity First

- No message editing or deletion
- No conversation branching or versioning
- No complex threading or reply mechanisms
- Synchronous, linear conversation flow only

### Clean Separation

- Business logic in shared package only
- UI components in platform-specific apps
- No platform-specific code in shared package
- Provider implementations are platform-agnostic (use fetch API)

### Testing Strategy

- Mock provider for E2E tests (no real API calls)
- NODE_ENV check in main process for test detection
- Unit tests for repositories and services
- Component tests for UI elements

## Non-Functional Requirements

### Performance

- Messages load instantly from local SQLite
- Parallel agent requests don't block UI
- Smooth scrolling for long conversations
- Efficient re-rendering on message updates

### Security

- No API keys in code or logs
- Secure storage of provider credentials
- Input sanitization for all user messages
- No execution of message content as code

### User Experience

- Clear visual hierarchy for messages
- Intuitive checkbox behavior
- Responsive design for different screen sizes
- Graceful error handling with user feedback

## Integration Points

### Existing Systems

- Integrates with existing conversation and conversation_agent tables
- Uses existing agent configuration system
- Leverages existing database bridge patterns
- Follows established repository patterns

### External APIs

- OpenAI Chat Completions API
- Anthropic Messages API
- Future: Additional LLM providers as needed

## Acceptance Criteria

### Core Functionality

- ✅ User can send messages in a conversation
- ✅ Multiple agents respond to messages in parallel
- ✅ All messages are persisted to SQLite database
- ✅ Messages display in correct chronological order
- ✅ Each message shows clear attribution (user/agent name)

### Message Inclusion Feature

- ✅ Every agent message has a visible checkbox
- ✅ Unchecked messages are excluded from future LLM context
- ✅ Checkbox states persist across sessions
- ✅ Users can modify checkboxes on historical messages
- ✅ Context sent to LLM only includes messages with `included=true`

### Agent Management

- ✅ Agent pills show all conversation agents
- ✅ Clicking an agent toggles enabled/disabled state
- ✅ Disabled agents don't receive new messages while disabled
- ✅ Re-enabled agents receive full conversation history on next message
- ✅ Users can send messages with all agents disabled (solo mode)
- ✅ Agent enabled states persist in database

### Provider Integration

- ✅ OpenAI provider successfully sends/receives messages
- ✅ Anthropic provider successfully sends/receives messages
- ✅ Mock provider works for E2E tests
- ✅ System prompts include agent role and personality
- ✅ Proper error handling for API failures

### State Management

- ✅ All state managed through Zustand stores
- ✅ No React Context usage for services
- ✅ State syncs correctly with database
- ✅ UI updates reactively to state changes

### Quality Requirements

- ✅ All TypeScript types properly defined
- ✅ Zod validation for all user inputs
- ✅ Repository pattern consistently applied
- ✅ No platform-specific code in shared package
- ✅ Code passes linting and type checking
- ✅ Unit tests for critical business logic

## Constraints

### Technical Constraints

- Must work with existing SQLite database
- Must follow established repository patterns
- Must maintain platform separation (desktop/shared)
- Cannot use platform-specific APIs in shared code

### Design Constraints

- No message editing after sending
- No message deletion functionality
- No conversation branching
- No threading or replies to specific messages
- Keep implementation simple and clean

## Success Metrics

- Users can have multi-agent conversations
- All messages persist correctly
- Message inclusion/exclusion works as designed
- System handles API failures gracefully
- E2E tests pass without using real APIs

## Future Considerations (Out of Scope)

- Streaming responses from LLM providers
- Image/file attachments
- Tool/function calling capabilities
- Message search functionality
- Export conversation history
- Token usage tracking
- Rate limiting and quotas

This project establishes the foundation for the core Fishbowl experience - enabling dynamic, multi-agent conversations with full user control over the conversation context.
