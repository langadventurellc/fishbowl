---
id: T-implement-conversationagentsre
title: Implement ConversationAgentsRepository class with CRUD operations
status: open
priority: medium
parent: F-database-schema-for
prerequisites:
  - T-create-conversationagent
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-25T03:07:08.545Z
updated: 2025-08-25T03:07:08.545Z
---

# Implement ConversationAgentsRepository Class with CRUD Operations

## Context

Create a comprehensive repository class for ConversationAgent database operations following the established pattern from `ConversationsRepository`. This repository will handle all database interactions for agent-to-conversation associations using the DatabaseBridge interface for proper separation of concerns.

**Related Issues:**

- Parent Feature: F-database-schema-for
- Parent Epic: E-add-agents-to-conversations
- Prerequisite: T-create-conversationagent (types must be defined first)

## Technical Requirements

### Repository Location

- **File**: `packages/shared/src/repositories/conversationAgents/ConversationAgentsRepository.ts`
- **Pattern**: Follow exact structure from `packages/shared/src/repositories/conversations/ConversationsRepository.ts`
- **Dependencies**: DatabaseBridge, CryptoUtilsInterface, logging utilities

### Repository Structure

```typescript
export class ConversationAgentsRepository {
  private readonly logger = createLoggerSync({
    context: { metadata: { component: "ConversationAgentsRepository" } },
  });

  constructor(
    private readonly databaseBridge: DatabaseBridge,
    private readonly cryptoUtils: CryptoUtilsInterface,
  ) {}

  // Core CRUD methods + domain-specific queries
}
```

## Required Methods

### Core CRUD Operations

```typescript
/**
 * Create a new conversation-agent association
 */
async create(input: CreateConversationAgentInput): Promise<ConversationAgent>

/**
 * Get a conversation-agent association by ID
 */
async get(id: string): Promise<ConversationAgent | null>

/**
 * Update an existing conversation-agent association
 */
async update(id: string, input: UpdateConversationAgentInput): Promise<ConversationAgent>

/**
 * Delete a conversation-agent association
 */
async delete(id: string): Promise<void>

/**
 * Check if a conversation-agent association exists
 */
async exists(id: string): Promise<boolean>
```

### Domain-Specific Queries

```typescript
/**
 * Find all agents associated with a specific conversation
 */
async findByConversationId(conversationId: string): Promise<ConversationAgent[]>

/**
 * Find all conversations that use a specific agent
 */
async findByAgentId(agentId: string): Promise<ConversationAgent[]>

/**
 * Check if a specific agent is already associated with a conversation
 */
async existsAssociation(conversationId: string, agentId: string): Promise<boolean>

/**
 * Get agents for a conversation ordered by display_order
 */
async getOrderedAgents(conversationId: string): Promise<ConversationAgent[]>

/**
 * Bulk delete all agents for a conversation (for conversation cleanup)
 */
async deleteByConversationId(conversationId: string): Promise<number>
```

## Implementation Details

### SQL Query Patterns

Follow established patterns from ConversationsRepository:

```sql
-- Create operation
INSERT INTO conversation_agents (id, conversation_id, agent_id, added_at, is_active, display_order)
VALUES (?, ?, ?, ?, ?, ?)

-- Read operations
SELECT * FROM conversation_agents WHERE id = ?
SELECT * FROM conversation_agents WHERE conversation_id = ? ORDER BY display_order ASC, added_at ASC
SELECT * FROM conversation_agents WHERE agent_id = ?

-- Update operations
UPDATE conversation_agents SET is_active = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?

-- Delete operations
DELETE FROM conversation_agents WHERE id = ?
DELETE FROM conversation_agents WHERE conversation_id = ?

-- Existence checks
SELECT 1 FROM conversation_agents WHERE id = ? LIMIT 1
SELECT 1 FROM conversation_agents WHERE conversation_id = ? AND agent_id = ? LIMIT 1
```

### Error Handling

```typescript
private handleDatabaseError(error: unknown, operation: string, context?: Record<string, unknown>): never {
  this.logger.error(`Database error during ${operation}`, error as Error, context);
  if (error instanceof Error) {
    throw error;
  }
  throw new Error(`Unexpected error during ${operation}`);
}
```

### Logging Integration

- Log all database operations with context
- Include conversation and agent IDs in log context
- Follow existing logging patterns from ConversationsRepository
- Use appropriate log levels (debug for operations, error for failures)

### Transaction Support

For bulk operations that require consistency:

```typescript
async bulkCreate(inputs: CreateConversationAgentInput[]): Promise<ConversationAgent[]> {
  return await this.databaseBridge.transaction(async (db) => {
    const results: ConversationAgent[] = [];
    for (const input of inputs) {
      const result = await this.createWithDB(db, input);
      results.push(result);
    }
    return results;
  });
}
```

## Database Field Mapping

### Field Transformations

```typescript
// Database row to ConversationAgent conversion
private mapRowToConversationAgent(row: DatabaseRow): ConversationAgent {
  return {
    id: row.id as string,
    conversationId: row.conversation_id as string,
    agentId: row.agent_id as string,
    addedAt: row.added_at as string,
    isActive: Boolean(row.is_active),
    displayOrder: row.display_order as number,
  };
}

// ConversationAgent to database values
private mapConversationAgentToValues(agent: Partial<ConversationAgent>): DatabaseValues {
  return {
    id: agent.id,
    conversation_id: agent.conversationId,
    agent_id: agent.agentId,
    added_at: agent.addedAt,
    is_active: agent.isActive ? 1 : 0,
    display_order: agent.displayOrder,
  };
}
```

### Timestamp Handling

```typescript
private getCurrentTimestamp(): string {
  return new Date().toISOString();
}
```

## Data Validation

### Input Validation

```typescript
// Validate inputs using Zod schemas before database operations
private validateCreateInput(input: CreateConversationAgentInput): CreateConversationAgentInput {
  return createConversationAgentInputSchema.parse(input);
}

private validateUpdateInput(input: UpdateConversationAgentInput): UpdateConversationAgentInput {
  return updateConversationAgentInputSchema.parse(input);
}
```

### Business Logic Validation

```typescript
// Prevent duplicate associations
private async checkDuplicateAssociation(conversationId: string, agentId: string): Promise<void> {
  const exists = await this.existsAssociation(conversationId, agentId);
  if (exists) {
    throw new ConversationAgentValidationError(
      `Agent ${agentId} is already associated with conversation ${conversationId}`
    );
  }
}
```

## Acceptance Criteria

### Core Functionality Requirements

- [ ] Repository class created following ConversationsRepository pattern
- [ ] All CRUD operations implemented with proper error handling
- [ ] Domain-specific query methods implemented
- [ ] DatabaseBridge integration working correctly
- [ ] CryptoUtils integration for ID generation
- [ ] Proper logging integration throughout

### SQL Operations Requirements

- [ ] Create operations generate UUIDs and set timestamps
- [ ] Read operations handle null results gracefully
- [ ] Update operations modify timestamps correctly
- [ ] Delete operations work with cascade constraints
- [ ] Bulk operations use transactions for consistency

### Data Transformation Requirements

- [ ] Database rows correctly mapped to ConversationAgent objects
- [ ] Boolean fields handled correctly (SQLite integer conversion)
- [ ] Timestamp fields properly formatted as ISO strings
- [ ] NULL handling implemented for optional fields

### Validation Requirements

- [ ] Input validation using Zod schemas
- [ ] Business logic validation (duplicate prevention)
- [ ] Proper error messages for validation failures
- [ ] Database constraint violations handled gracefully

### Error Handling Requirements

- [ ] Database errors logged and re-thrown appropriately
- [ ] Custom error types used where appropriate
- [ ] Context provided in error messages for debugging
- [ ] Transaction rollbacks work correctly on errors

### Performance Requirements

- [ ] Queries optimized using proper indexing
- [ ] Bulk operations use transactions for efficiency
- [ ] No N+1 query problems in related operations
- [ ] Appropriate use of LIMIT clauses for existence checks

## Testing Strategy

### Unit Tests Required

Create comprehensive test suite at:
`packages/shared/src/repositories/conversationAgents/__tests__/ConversationAgentsRepository.test.ts`

**Test Categories:**

- CRUD operation success and failure cases
- Domain-specific query methods
- Input validation and error handling
- Database constraint violation handling
- Transaction rollback scenarios
- Logging integration verification
- Edge cases and boundary conditions

**Mock Strategy:**

- Mock DatabaseBridge for all database operations
- Mock CryptoUtilsInterface for ID generation
- Use Jest mocking patterns from ConversationsRepository tests
- Test both success paths and error scenarios

## Dependencies

- **Prerequisite**: T-create-conversationagent (ConversationAgent types)
- **Database**: DatabaseBridge interface
- **Utilities**: CryptoUtilsInterface, logging utilities
- **Validation**: Zod schemas from types package
- **Testing**: Jest, existing test utilities

## Files to Create

- `packages/shared/src/repositories/conversationAgents/ConversationAgentsRepository.ts`
- `packages/shared/src/repositories/conversationAgents/index.ts` (barrel export)
- `packages/shared/src/repositories/conversationAgents/__tests__/ConversationAgentsRepository.test.ts`
- `packages/shared/src/repositories/conversationAgents/__tests__/exports.test.ts`

## Integration Points

- Consumed by ConversationAgentService (to be created in later features)
- Uses DatabaseBridge from shared services
- Uses ConversationAgent types from types package
- Integrates with existing repository patterns

## Reference Materials

- **Primary Pattern**: `packages/shared/src/repositories/conversations/ConversationsRepository.ts`
- **Test Pattern**: `packages/shared/src/repositories/conversations/__tests__/ConversationsRepository.test.ts`
- **Database Schema**: `migrations/002_create_conversation_agents.sql`
- **Type Definitions**: ConversationAgent types from prerequisite task

## Code Quality Standards

- Follow exact patterns from ConversationsRepository
- Include comprehensive JSDoc documentation
- Use TypeScript strict mode compliance
- Follow existing error handling patterns
- Maintain consistent logging throughout
- Use proper transaction management for bulk operations
