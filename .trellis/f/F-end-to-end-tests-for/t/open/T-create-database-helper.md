---
id: T-create-database-helper
title: Create Database Helper Functions for Conversation Agent Testing
status: open
priority: high
parent: F-end-to-end-tests-for
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-25T23:41:26.223Z
updated: 2025-08-25T23:41:26.223Z
---

# Task: Create Database Helper Functions for Conversation Agent Testing

## Context

The conversation agent end-to-end tests require database verification capabilities to ensure conversation_agents table operations work correctly. This task creates database helper functions following existing patterns established in `tests/desktop/helpers/database/`.

## Reference Patterns

- Follow pattern from `queryConversations.ts` for conversation_agents queries
- Use `queryDatabase.ts` generic function for SQL execution
- Match structure from existing database helpers in `/tests/desktop/helpers/database/`

## Database Schema Reference

```sql
CREATE TABLE conversation_agents (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    agent_id TEXT NOT NULL,  -- References agent config ID from settings
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1,
    display_order INTEGER DEFAULT 0,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    UNIQUE(conversation_id, agent_id)
);
```

## Implementation Requirements

### 1. Create queryConversationAgents.ts

**File Path**: `tests/desktop/helpers/database/queryConversationAgents.ts`

**Function Signatures**:

```typescript
// Query all conversation agents or by conversation ID
queryConversationAgents(
  electronApp: TestElectronApplication,
  conversationId?: string
): Promise<ConversationAgentDbRow[]>

// Interface for database row structure
interface ConversationAgentDbRow {
  id: string;
  conversation_id: string;
  agent_id: string;
  added_at: string;
  is_active: number;  // SQLite stores boolean as 0/1
  display_order: number;
}
```

**SQL Queries**:

- All agents: `SELECT * FROM conversation_agents ORDER BY display_order ASC, added_at ASC`
- By conversation: `SELECT * FROM conversation_agents WHERE conversation_id = ? ORDER BY display_order ASC, added_at ASC`

### 2. Create waitForConversationAgentInDb.ts

**File Path**: `tests/desktop/helpers/database/waitForConversationAgentInDb.ts`

**Function Signature**:

```typescript
// Wait for conversation agent to appear in database
waitForConversationAgentInDb(
  electronApp: TestElectronApplication,
  conversationId: string,
  agentId: string,
  timeout: number = 5000
): Promise<ConversationAgentDbRow>
```

**Implementation**: Polling pattern with configurable timeout, similar to database waiting patterns in existing helpers.

### 3. Update Database Index Export

**File Path**: `tests/desktop/helpers/database/index.ts`

**Additions**:

```typescript
export { queryConversationAgents } from "./queryConversationAgents";
export { waitForConversationAgentInDb } from "./waitForConversationAgentInDb";
```

## Technical Approach

### Error Handling

- Handle database connection failures gracefully
- Provide descriptive error messages for debugging
- Include retry logic for transient failures

### Type Safety

- Define TypeScript interfaces for database row structures
- Use proper typing for all function parameters and returns
- Ensure compatibility with existing TestElectronApplication type

### Testing Pattern Consistency

- Follow established patterns from `queryConversations.ts`
- Use consistent parameter naming and structure
- Match error handling approaches from existing helpers

## Acceptance Criteria

### Functional Requirements

- ✅ queryConversationAgents function queries conversation_agents table correctly
- ✅ Function supports both all-agents and conversation-specific queries
- ✅ waitForConversationAgentInDb function waits for database record with timeout
- ✅ Functions return properly typed database row objects
- ✅ Helper functions exported from database index

### Integration Requirements

- ✅ Functions integrate seamlessly with existing TestElectronApplication infrastructure
- ✅ Database connections use existing patterns from queryDatabase.ts
- ✅ Error handling matches patterns from existing database helpers
- ✅ Function signatures allow easy testing of conversation agent scenarios

### Quality Requirements

- ✅ Functions handle database connection failures gracefully
- ✅ Timeout logic prevents test hangs in wait functions
- ✅ TypeScript interfaces provide proper type safety
- ✅ Functions follow established database helper patterns

## Dependencies

- Existing database helper infrastructure in `tests/desktop/helpers/database/`
- TestElectronApplication type from test helpers
- Database connection patterns from queryDatabase.ts

## Testing Approach

- Functions will be validated through integration with main test suites
- Error handling verified through connection failure scenarios
- Timeout behavior tested through extended wait conditions
