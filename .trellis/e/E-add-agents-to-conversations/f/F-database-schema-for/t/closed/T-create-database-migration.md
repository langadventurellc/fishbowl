---
id: T-create-database-migration
title: Create database migration script for conversation_agents table
status: done
priority: high
parent: F-database-schema-for
prerequisites: []
affectedFiles:
  migrations/002_create_conversation_agents.sql: Created new database migration
    script with conversation_agents table definition, including comprehensive
    comments explaining design decisions, proper foreign key relationships,
    unique constraints, and performance indexes following SQLite best practices
    and existing project conventions.
log:
  - Successfully created database migration script
    002_create_conversation_agents.sql for agent-to-conversation associations.
    The migration follows established patterns from 001_create_conversations.sql
    with comprehensive documentation, proper indexing, and idempotent SQL using
    IF NOT EXISTS patterns. Key features include foreign key constraint on
    conversation_id with CASCADE DELETE, unique constraint preventing duplicate
    agent assignments, and three strategic indexes for optimal query
    performance. The agent_id field correctly references configuration data
    rather than database foreign keys, as specified. All quality checks pass and
    migration is ready for production use.
schema: v1.0
childrenIds: []
created: 2025-08-25T03:05:38.134Z
updated: 2025-08-25T03:05:38.134Z
---

# Create Database Migration Script for Conversation Agents Table

## Context

This task implements the foundational database schema for the agent-to-conversation association feature. Following the existing migration pattern established in `001_create_conversations.sql`, create migration `002_create_conversation_agents.sql` to support linking configured agents to specific conversations.

**Related Issues:**

- Parent Feature: F-database-schema-for
- Parent Epic: E-add-agents-to-conversations

## Technical Requirements

### Migration File

- **Location**: `migrations/002_create_conversation_agents.sql`
- **Naming Pattern**: Follow existing numbered migration convention
- **Rollback Support**: Include proper rollback capability

### Table Schema

```sql
-- Table: conversation_agents
-- Purpose: Associates configured agents with conversations
-- Note: agent_id references configuration data, NOT a database foreign key
CREATE TABLE IF NOT EXISTS conversation_agents (
    id TEXT PRIMARY KEY,                              -- UUID stored as text
    conversation_id TEXT NOT NULL,                    -- Foreign key to conversations
    agent_id TEXT NOT NULL,                          -- Configuration ID (NOT FK)
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,      -- ISO 8601 timestamp
    is_active BOOLEAN DEFAULT 1,                     -- Active status flag
    display_order INTEGER DEFAULT 0,                 -- Future ordering support
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    UNIQUE(conversation_id, agent_id)                -- Prevent duplicates
);
```

### Indexes

- `idx_conversation_agents_conversation` on `conversation_id` for efficient lookups
- `idx_conversation_agents_agent` on `agent_id` for query performance

## Implementation Details

### Key Design Notes

1. **agent_id Field**: Stores configuration IDs from application settings, NOT database foreign keys
2. **CASCADE DELETE**: When conversations are deleted, associated agents are automatically removed
3. **Unique Constraint**: Prevents duplicate agent assignments to same conversation
4. **TEXT Storage**: Use TEXT for UUID storage following SQLite best practices
5. **Future Fields**: `is_active` and `display_order` support future enhancements

### Migration Structure

Follow the existing pattern from `001_create_conversations.sql`:

- Comprehensive comments explaining purpose and design decisions
- SQL commands with IF NOT EXISTS clauses for safety
- Proper indexing for performance
- Clear rollback instructions (commented out by default)

## Acceptance Criteria

### Functional Requirements

- [ ] Migration file created at `migrations/002_create_conversation_agents.sql`
- [ ] Table created with all required fields and correct data types
- [ ] Foreign key constraint on `conversation_id` with CASCADE DELETE
- [ ] Unique constraint on `(conversation_id, agent_id)` pair
- [ ] Both indexes created for optimal query performance
- [ ] Migration includes comprehensive comments and documentation

### Technical Validation

- [ ] Migration runs successfully on clean database
- [ ] Migration is idempotent (can be run multiple times safely)
- [ ] Table structure matches specification exactly
- [ ] Foreign key relationships work correctly
- [ ] Unique constraint prevents duplicate records
- [ ] Rollback capability documented and tested

### Code Quality

- [ ] Comments explain design decisions, especially agent_id purpose
- [ ] SQL follows existing code style and formatting
- [ ] Migration file structure matches existing pattern
- [ ] All SQL commands use IF NOT EXISTS for safety

## Testing Strategy

- Verify migration runs without errors on clean database
- Test foreign key constraint works (cascade delete)
- Test unique constraint prevents duplicates
- Verify indexes improve query performance
- Test rollback documentation is accurate

## Dependencies

- None (foundational database schema)

## Files to Create

- `migrations/002_create_conversation_agents.sql`

## Reference Materials

- Existing migration: `migrations/001_create_conversations.sql`
- Feature specification: F-database-schema-for
- Epic context: E-add-agents-to-conversations
