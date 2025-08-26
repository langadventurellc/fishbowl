---
id: T-implement-database-integrity
title: Implement Database Integrity Tests for Conversation Agents
status: open
priority: medium
parent: F-end-to-end-tests-for
prerequisites:
  - T-create-database-helper
  - T-create-ui-interaction-helper
  - T-create-test-setup-helper
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-25T23:45:18.945Z
updated: 2025-08-25T23:45:18.945Z
---

# Task: Implement Database Integrity Tests for Conversation Agents

## Context

Create end-to-end tests that focus specifically on database operations, constraints, and data integrity for the conversation_agents table. These tests verify that database-level rules and relationships work correctly under various conditions.

## Reference Patterns

- Database testing patterns from conversation tests
- SQLite constraint testing approaches
- Create conversation test helpers `tests/desktop/helpers/conversations/createConversation.ts`
- Foreign key relationship verification
- Database cleanup and isolation patterns

## Test Coverage Requirements

This test file implements **Acceptance Criteria AC4** from the feature specification:

### AC4: Database Integrity and Cleanup

**Given** conversation agents are created  
**When** testing data persistence and cleanup:

**Then:**

- conversation_agents records persist correctly in database
- Conversation deletion cascade-deletes associated conversation_agents
- Database queries return correct agent associations
- No orphaned records remain after cleanup operations

## Implementation Requirements

### 1. Create Database Integrity Test File

**File Path**: `tests/desktop/features/conversation-agents/conversation-agent-database.spec.ts`

### 2. Test Structure

```typescript
import { expect, test } from "@playwright/test";
import {
  // Setup helpers
  setupConversationAgentTestSuite,
  setupConversationAgentTest,

  // Database helpers
  queryConversationAgents,
  queryDatabase,
  queryConversations,
  waitForConversationAgentInDb,
  resetDatabase,

  // UI helpers for setup
  clickAddAgentButton,
  waitForAddAgentModal,
  selectAgentInModal,
} from "../../../helpers";

test.describe("Feature: Conversation Agent Database Integrity", () => {
  const testSuite = setupConversationAgentTestSuite();

  // Test scenarios
});
```

### 3. Test Scenarios to Implement

#### Scenario 1: Basic Record Creation and Structure

- **Setup**: Complete conversation agent test setup
- **Action**: Add agent to conversation via UI
- **Verification**:
  - conversation_agents record created with correct structure
  - All required fields populated (id, conversation_id, agent_id, added_at)
  - Default values applied correctly (is_active=1, display_order=0)
  - UUID format validation for id field

#### Scenario 2: Foreign Key Constraint Verification

- **Setup**: Create conversation and agent, then add agent to conversation
- **Action**: Verify foreign key relationships
- **Verification**:
  - conversation_id references valid record in conversations table
  - Foreign key constraint prevents invalid conversation_id
  - Record structure matches expected schema
  - Referential integrity maintained

#### Scenario 3: Unique Constraint Enforcement

- **Setup**: Create conversation with agent already added
- **Action**: Attempt to add same agent to same conversation again
- **Verification**:
  - Database prevents duplicate conversation_id + agent_id pairs
  - Unique constraint properly enforced
  - Error handling works correctly
  - No partial records created

#### Scenario 4: Cascade Deletion Verification

- **Setup**: Create conversations with multiple agents assigned
- **Action**: Delete parent conversation
- **Verification**:
  - All associated conversation_agents records deleted automatically
  - No orphaned conversation_agents remain
  - Other conversations' agents unaffected
  - Cascade deletion follows ON DELETE CASCADE specification

#### Scenario 5: Index Performance and Query Correctness

- **Setup**: Create large dataset with multiple conversations and agents
- **Action**: Execute various query patterns
- **Verification**:
  - Queries by conversation_id use proper index
  - Queries by agent_id use proper index
  - Complex queries return correct results
  - Query performance meets expectations

#### Scenario 6: Database Schema Compliance

- **Setup**: Fresh database state
- **Action**: Verify table structure and constraints
- **Verification**:
  - Table exists with correct name and structure
  - All indexes created as specified
  - Column types and constraints match migration
  - Database metadata reflects expected schema

### 4. Implementation Details

#### Record Structure Verification

```typescript
// Verify complete record structure
const conversationAgents = await queryConversationAgents(
  electronApp,
  conversationId,
);
const record = conversationAgents[0]!;

expect(record.id).toMatch(/^[0-9a-f-]{36}$/); // UUID format
expect(record.conversation_id).toBe(conversationId);
expect(record.agent_id).toBe(testAgent.id);
expect(record.is_active).toBe(1);
expect(record.display_order).toBe(0);
expect(new Date(record.added_at).getTime()).toBeGreaterThan(0);
```

#### Foreign Key Testing

```typescript
// Test foreign key constraint
const validConversationId = "valid-conversation-id";
const invalidConversationId = "nonexistent-conversation-id";

// Should work with valid conversation_id
const validRecord = await queryDatabase(
  electronApp,
  `INSERT INTO conversation_agents (id, conversation_id, agent_id) VALUES (?, ?, ?)`,
  ["test-id", validConversationId, "test-agent-id"],
);

// Should fail with invalid conversation_id due to foreign key constraint
await expect(
  queryDatabase(
    electronApp,
    `INSERT INTO conversation_agents (id, conversation_id, agent_id) VALUES (?, ?, ?)`,
    ["test-id-2", invalidConversationId, "test-agent-id"],
  ),
).rejects.toThrow(/FOREIGN KEY constraint failed/);
```

#### Unique Constraint Testing

```typescript
// Test unique constraint on (conversation_id, agent_id)
await queryDatabase(
  electronApp,
  `INSERT INTO conversation_agents (id, conversation_id, agent_id) VALUES (?, ?, ?)`,
  ["test-id-1", conversationId, agentId],
);

// Second insert with same conversation_id + agent_id should fail
await expect(
  queryDatabase(
    electronApp,
    `INSERT INTO conversation_agents (id, conversation_id, agent_id) VALUES (?, ?, ?)`,
    ["test-id-2", conversationId, agentId],
  ),
).rejects.toThrow(/UNIQUE constraint failed/);
```

#### Cascade Deletion Testing

```typescript
// Setup conversation with agents
const initialAgents = await queryConversationAgents(
  electronApp,
  conversationId,
);
expect(initialAgents).toHaveLength(2);

// Delete parent conversation
await queryDatabase(electronApp, `DELETE FROM conversations WHERE id = ?`, [
  conversationId,
]);

// Verify cascade deletion
const remainingAgents = await queryConversationAgents(
  electronApp,
  conversationId,
);
expect(remainingAgents).toHaveLength(0);

// Verify other conversations unaffected
const otherConversationAgents = await queryConversationAgents(
  electronApp,
  otherConversationId,
);
expect(otherConversationAgents).toHaveLength(1);
```

#### Schema Verification

```typescript
// Verify table structure
const tableInfo = await queryDatabase(
  electronApp,
  `PRAGMA table_info(conversation_agents)`,
);

expect(tableInfo).toEqual(
  expect.arrayContaining([
    expect.objectContaining({ name: "id", type: "TEXT", pk: 1 }),
    expect.objectContaining({
      name: "conversation_id",
      type: "TEXT",
      notnull: 1,
    }),
    expect.objectContaining({ name: "agent_id", type: "TEXT", notnull: 1 }),
    expect.objectContaining({ name: "added_at", type: "DATETIME" }),
    expect.objectContaining({ name: "is_active", type: "BOOLEAN" }),
    expect.objectContaining({ name: "display_order", type: "INTEGER" }),
  ]),
);

// Verify indexes exist
const indexes = await queryDatabase(
  electronApp,
  `PRAGMA index_list(conversation_agents)`,
);
expect(indexes).toEqual(
  expect.arrayContaining([
    expect.objectContaining({ name: "idx_conversation_agents_conversation" }),
    expect.objectContaining({ name: "idx_conversation_agents_agent" }),
    expect.objectContaining({ name: "idx_conversation_agents_composite" }),
  ]),
);
```

## Technical Approach

### Direct Database Testing

- Use SQL queries directly rather than UI interactions for pure database tests
- Test database constraints and triggers independently
- Verify schema compliance against migration specifications

### Constraint Testing Strategy

- Test each constraint individually and in combination
- Verify both successful operations and expected failures
- Test edge cases and boundary conditions

### Performance Testing

- Measure query performance with realistic data volumes
- Verify index usage with EXPLAIN QUERY PLAN
- Test concurrent access patterns where applicable

## Acceptance Criteria

### Data Integrity Requirements

- ✅ All database constraints function as specified
- ✅ Foreign key relationships prevent invalid data
- ✅ Unique constraints prevent duplicate assignments
- ✅ Cascade deletion removes orphaned records correctly
- ✅ Default values populate as expected

### Schema Compliance Requirements

- ✅ Table structure matches migration specification exactly
- ✅ All required indexes exist and function correctly
- ✅ Column types and constraints match design
- ✅ Database metadata reflects expected configuration

### Performance Requirements

- ✅ Basic queries complete within 100ms
- ✅ Index usage verified for common query patterns
- ✅ Large dataset queries remain performant
- ✅ Constraint checking doesn't cause significant delays

## Dependencies

- Database helper functions from prerequisite tasks
- Migration 002_create_conversation_agents.sql implementation
- Foreign key relationship with conversations table
- Database testing infrastructure and utilities

## Integration Points

- Validates database schema created by migration scripts
- Ensures database layer supports UI functionality correctly
- Verifies data integrity for conversation agent relationships
- Confirms database design meets application requirements
