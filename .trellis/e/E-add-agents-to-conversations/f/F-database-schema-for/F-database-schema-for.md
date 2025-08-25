---
id: F-database-schema-for
title: Database Schema for Conversation Agents
status: in-progress
priority: medium
parent: E-add-agents-to-conversations
prerequisites: []
affectedFiles:
  migrations/002_create_conversation_agents.sql: Created new database migration
    script with conversation_agents table definition, including comprehensive
    comments explaining design decisions, proper foreign key relationships,
    unique constraints, and performance indexes following SQLite best practices
    and existing project conventions.
  packages/shared/src/types/conversationAgents/ConversationAgent.ts:
    Core ConversationAgent interface matching database schema with comprehensive
    JSDoc documentation
  packages/shared/src/types/conversationAgents/AddAgentToConversationInput.ts: Input type for adding agents to conversations with optional display_order
  packages/shared/src/types/conversationAgents/RemoveAgentFromConversationInput.ts: Input type for removing agents from conversations
  packages/shared/src/types/conversationAgents/UpdateConversationAgentInput.ts: Input type for updating conversation agent associations
  packages/shared/src/types/conversationAgents/ConversationAgentResult.ts: Result type for single conversation agent operations
  packages/shared/src/types/conversationAgents/ConversationAgentsResult.ts: Result type for multiple conversation agents operations
  packages/shared/src/types/conversationAgents/schemas/conversationAgentSchema.ts: Zod schema for complete conversation agent validation with business rules
  packages/shared/src/types/conversationAgents/schemas/addAgentToConversationInputSchema.ts: Zod schema for validating agent addition input
  packages/shared/src/types/conversationAgents/schemas/removeAgentFromConversationInputSchema.ts: Zod schema for validating agent removal input
  packages/shared/src/types/conversationAgents/schemas/updateConversationAgentInputSchema.ts: Zod schema for validating conversation agent updates with refine logic
  packages/shared/src/types/conversationAgents/schemas/index.ts: Barrel export file for schemas and inferred types
  packages/shared/src/types/conversationAgents/errors/ConversationAgentNotFoundError.ts:
    Custom error for conversation agent not found scenarios with flexible
    constructor parameters
  packages/shared/src/types/conversationAgents/errors/ConversationAgentValidationError.ts: Custom error for validation failures with detailed error information
  packages/shared/src/types/conversationAgents/errors/DuplicateAgentError.ts: Custom error for duplicate agent assignment attempts
  packages/shared/src/types/conversationAgents/errors/index.ts: Barrel export file for error classes
  packages/shared/src/types/conversationAgents/index.ts: Main barrel export file for all conversation agent types
  packages/shared/src/types/index.ts: Added conversationAgents export to main types index
  packages/shared/src/types/conversationAgents/schemas/__tests__/conversationAgentSchema.test.ts:
    Comprehensive tests for core schema validation covering all fields and edge
    cases
  packages/shared/src/types/conversationAgents/schemas/__tests__/addAgentToConversationInputSchema.test.ts: Tests for agent addition input validation schema
  packages/shared/src/types/conversationAgents/schemas/__tests__/updateConversationAgentInputSchema.test.ts: Tests for agent update input validation including refine logic
  packages/shared/src/types/conversationAgents/errors/__tests__/ConversationAgentNotFoundError.test.ts:
    Tests for ConversationAgentNotFoundError with various constructor parameters
    and serialization
  packages/shared/src/types/conversationAgents/errors/__tests__/ConversationAgentValidationError.test.ts: Tests for ConversationAgentValidationError with multiple validation scenarios
  packages/shared/src/types/conversationAgents/errors/__tests__/DuplicateAgentError.test.ts: Tests for DuplicateAgentError with various ID formats and edge cases
log: []
schema: v1.0
childrenIds:
  - T-add-comprehensive-unit-tests
  - T-create-conversationagent
  - T-implement-conversationagentsre
  - T-update-shared-package-exports
  - T-create-database-migration
created: 2025-08-25T02:58:38.685Z
updated: 2025-08-25T02:58:38.685Z
---

# Database Schema for Conversation Agents

## Purpose

Create the database infrastructure to support agent-to-conversation associations, including schema, migration scripts, and type definitions.

## Key Components to Implement

- Database migration script `002_create_conversation_agents.sql`
- Type definitions for `ConversationAgent` interface
- Database store class for CRUD operations
- Unit tests for migration and store operations

## Detailed Acceptance Criteria

### Database Schema Requirements

✅ **Table Structure**

- `conversation_agents` table created with all required fields
- `id` field as TEXT PRIMARY KEY for UUID storage
- `conversation_id` as TEXT NOT NULL with foreign key to conversations table
- `agent_id` as TEXT NOT NULL (stores configuration ID, NOT a foreign key)
- `added_at` field with DATETIME DEFAULT CURRENT_TIMESTAMP
- `is_active` field as BOOLEAN DEFAULT 1
- `display_order` field as INTEGER DEFAULT 0

✅ **Constraints and Indexes**

- FOREIGN KEY constraint on conversation_id with ON DELETE CASCADE
- UNIQUE constraint on (conversation_id, agent_id) pair
- Index on conversation_id for efficient lookups
- Index on agent_id for query performance
- Proper rollback capability in migration

✅ **Type System**

- `ConversationAgent` interface in packages/shared/src/types/
- All fields properly typed with TypeScript
- JSDoc comments explaining agent_id is configuration reference
- Export from shared package barrel file

✅ **Store Implementation**

- `ConversationAgentStore` class in shared package
- Methods: create, findByConversation, findByAgent, delete, exists
- Proper error handling with typed errors
- Transaction support for bulk operations
- Logging integration following existing patterns

## Technical Requirements

- Follow existing migration naming pattern (numbered prefix)
- Use TEXT for UUID storage (SQLite best practice)
- Implement using existing DatabaseBridge interface
- Follow existing store patterns from ConversationStore
- No direct database access from renderer process

## Implementation Guidance

1. Start with migration script following `001_create_conversations.sql` pattern
2. Create type definitions matching database schema
3. Implement store class with DatabaseBridge dependency injection
4. Add comprehensive unit tests for migration and store
5. Update shared package exports

## Testing Requirements

- Migration runs successfully on clean database
- Migration rollback works correctly
- Store CRUD operations work as expected
- Cascade delete removes conversation_agents when conversation deleted
- Unique constraint prevents duplicate agent assignments
- Indexes improve query performance

## Dependencies

- None (foundational feature)
