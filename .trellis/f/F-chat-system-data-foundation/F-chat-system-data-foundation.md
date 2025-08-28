---
id: F-chat-system-data-foundation
title: Chat System Data Foundation
status: open
priority: medium
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-28T03:19:44.215Z
updated: 2025-08-28T03:19:44.215Z
---

# Chat System Data Foundation

## Overview

Implement the core data layer for the Fishbowl chat system, establishing the foundation for multi-agent conversations. This feature focuses exclusively on the data infrastructure needed to store messages, manage conversation agents, and provide the repository patterns required for the chat functionality.

## Purpose

Create the database schema, TypeScript types, and repository layer that will enable:

- Message persistence in SQLite database
- Conversation agent state management (enabled/disabled)
- Message inclusion control for LLM context building
- Proper data validation and type safety

## Key Components to Implement

### 1. Database Schema Updates

- **Messages Table**: New table for storing all chat messages with proper relationships (FKs to `conversations` and `conversation_agents`).
- **Conversation Agents Migration**: Add `enabled` column to existing `conversation_agents` table (separate from existing `is_active`).
- **Database Indexes**: Optimize query performance for message retrieval using house-style index naming.
- **Migration Location**: Place SQL at root `migrations/` as `003_create_messages.sql` (picked up by the existing migration copier).

### 2. TypeScript Type System

- **Message Types**: Complete type definitions with Zod validation schemas.
- **Message Role Enum**: `"user" | "agent" | "system"` (use "agent" consistently; never "assistant").
- **Input/Output Types**: Create input and inclusion-only update input types.
- **No Length Enforcement in Data Layer**: Do not enforce max content length in schemas; UI handles any limits.

### 3. Repository Layer

- **MessageRepository**: Minimal API following existing patterns
  - `createMessage`
  - `getMessage(id)`
  - `getMessagesByConversation(conversationId)`
  - `updateMessageInclusion(id, included)`
- **Database Operations**: Create/read and inclusion toggle only (no content edit/delete).
- **Query Optimization**: Efficient message retrieval by conversation and timestamp.

## Detailed Acceptance Criteria

### Database Schema Requirements

- ✅ Messages table created with all required columns (id, conversation_id, conversation_agent_id, role, content, included, created_at)
- ✅ `conversation_agent_id` correctly references `conversation_agents(id)` (not settings config)
- ✅ Foreign key relationships properly established to `conversations` and `conversation_agents` tables
- ✅ Composite index on `(conversation_id, created_at)` created with house-style name `idx_messages_conversation`
- ✅ Migration adds `enabled` column to `conversation_agents` table with default value true (distinct from `is_active`)
- ✅ All schema changes are backward compatible with existing data
- ✅ New migration file added at root `migrations/003_create_messages.sql`

### Type System Requirements

- ✅ Message schema defined with Zod validation including all fields
- ✅ MessageRole enum exported with 'user', 'agent', 'system' values (no 'assistant')
- ✅ CreateMessageInput does not enforce content length constraints (UI handles any limits)
- ✅ UpdateMessageInput type allows modification of inclusion state
- ✅ All types exported from shared package index for platform consumption
- ✅ Type definitions follow existing patterns in the codebase

### Repository Implementation Requirements

- ✅ MessageRepository exposes minimal methods (create, get by id, list by conversation, update inclusion)
- ✅ createMessage() method stores new messages with proper validation
- ✅ getMessagesByConversation() retrieves messages ordered by created_at
- ✅ updateMessageInclusion() toggles the included field for context control
- ✅ Repository uses existing database bridge patterns for platform abstraction
- ✅ Error handling follows existing repository error patterns
- ✅ All database operations are properly typed and validated

### Data Validation Requirements

- ✅ Message role validates against defined enum values
- ✅ Conversation and agent IDs validate as proper UUIDs
- ✅ Created timestamps default to current time
- ✅ Boolean fields (included, enabled) have proper defaults
- ✅ Foreign key constraints prevent orphaned records

### Integration Requirements

- ✅ Works with existing conversation and conversation_agent tables
- ✅ Follows established database bridge abstraction patterns
- ✅ Repository integrates with existing service injection patterns
- ✅ Types are consumable by both desktop and future mobile platforms
- ✅ No platform-specific code in shared package implementation

## Implementation Guidance

### Technical Approach

- **Follow Existing Patterns**: Use ConversationsRepository as template for consistent implementation
- **Database Bridge Pattern**: Utilize existing DatabaseBridge abstraction for platform independence
- **Zod Validation**: All input/output types must have corresponding Zod schemas for runtime validation
- **UUID Generation**: Use existing UUID utilities for consistent ID generation
- **Error Handling**: Follow established error patterns from existing repositories
- **Repository Interface**: `MessageRepositoryInterface` is optional; add only if/when it provides clear DI/testing value

### File Organization

```
packages/shared/src/
├── types/messages/
│   ├── Message.ts (core types and schemas)
│   ├── MessageInput.ts (create input type)
│   ├── UpdateMessageInclusionInput.ts (inclusion-only update type)
│   └── index.ts (barrel exports)
├── repositories/messages/
│   ├── MessageRepository.ts (main repository class)
│   └── index.ts (barrel exports)
└── types/index.ts (add message exports)

migrations/
└── 003_create_messages.sql (root-level migration with house-style index name)
```

### Testing Requirements

- **Repository Tests**: Unit tests for repository methods using test database
- **Type Validation Tests**: Verify Zod schemas reject invalid input

### Security Considerations

- **SQL Injection Prevention**: Use parameterized queries for all database operations
- **Foreign Key Integrity**: Prevent orphaned messages through proper constraint handling
- **Content Handling**: Store content verbatim (no DB-layer truncation); any length limits are UI-only

## Dependencies

- **Existing Database Tables**: conversations, conversation_agents tables must exist
- **Database Bridge**: Existing DatabaseBridge abstraction for platform independence
- **Zod Library**: For runtime type validation and schema definition
- **UUID Utilities**: Existing ID generation utilities from shared package
- **Migration System**: Existing migration execution infrastructure

## Technical Constraints

- **SQLite Compatibility**: All SQL syntax must work with SQLite database engine
- **Platform Independence**: No Node.js or browser-specific APIs in shared package
- **Backward Compatibility**: Changes cannot break existing conversation functionality
- **Type Safety**: All database operations must be fully typed with compile-time safety
- **Migrations**: Forward-only; down/rollback scripts are not required

## Success Criteria

- **Database Schema**: Messages table created and indexed properly
- **Type System**: All message types defined and validated with Zod
- **Repository Layer**: MessageRepository provides minimal required operations (create/get/list/update inclusion)
- **Data Integrity**: Foreign key relationships maintain referential integrity
- **Test Coverage**: All repository methods covered with unit tests
- **Code Quality**: Implementation passes linting, type checking, and follows existing patterns

## Out of Scope

This feature explicitly does NOT include:

- UI components or React hooks
- LLM provider integration or API calls
- Real-time message updates or WebSocket connections
- Message content editing, deletion, or conversation branching
- State management stores (Zustand) or service layer
- Authentication or authorization logic
- Performance optimization beyond basic indexing
