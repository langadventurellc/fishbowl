---
id: T-update-conversationsrepository-1
title: Update ConversationsRepository for chat_mode CRUD operations
status: open
priority: high
parent: F-service-layer-integration
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-03T19:50:25.485Z
updated: 2025-09-03T19:50:25.485Z
---

# Update ConversationsRepository for chat_mode CRUD operations

## Context

Update the `ConversationsRepository` class to properly handle the new `chat_mode` field in all CRUD operations. This task implements the repository layer changes needed for Service Layer Integration (F-service-layer-integration) in the Chat Modes System Epic (E-chat-modes-system).

The database schema and core types have already been updated in the prerequisite feature F-database-schema-and-core-types, so the `chat_mode` column exists in the database and the types are available.

## Related Documentation

- Epic: E-chat-modes-system
- Feature: F-service-layer-integration
- Prerequisite: F-database-schema-and-core-types (completed)

## Technical Implementation

### Files to Modify

- `packages/shared/src/repositories/conversations/ConversationsRepository.ts` - Main repository implementation
- `packages/shared/src/repositories/conversations/__tests__/ConversationsRepository.test.ts` - Unit tests

### Specific Changes Required

#### CREATE Operations

Update the `create()` method to:

- Explicitly set `chat_mode: 'round-robin'` for new conversations (override database default)
- Include chat_mode in the INSERT SQL statement
- Ensure proper parameterized query usage

```typescript
// Example implementation guidance
async create(input: CreateConversationInput): Promise<Conversation> {
  const conversation = {
    id: generateId(),
    title: input.title,
    chat_mode: "round-robin" as const, // Explicit default for new conversations
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const result = await this.db.run(
    "INSERT INTO conversations (id, title, chat_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
    [conversation.id, conversation.title, conversation.chat_mode, conversation.created_at, conversation.updated_at]
  );

  return conversation;
}
```

#### SELECT Operations

Update query methods to:

- Include `chat_mode` field in all SELECT statements
- Ensure `get()` and `list()` methods return conversations with chat_mode field
- Maintain existing query patterns and performance

#### UPDATE Operations

Update the `update()` method to:

- Support updating `chat_mode` field via `UpdateConversationInput`
- Build dynamic UPDATE queries including chat_mode when provided
- Handle partial updates (chat_mode only, title only, or both)
- Maintain transaction safety and atomic updates

```typescript
// Example implementation guidance
async update(id: string, updates: UpdateConversationInput): Promise<Conversation> {
  const fields = [];
  const values = [];

  if (updates.title !== undefined) {
    fields.push("title = ?");
    values.push(updates.title);
  }

  if (updates.chat_mode !== undefined) {
    fields.push("chat_mode = ?");
    values.push(updates.chat_mode);
  }

  fields.push("updated_at = ?");
  values.push(new Date().toISOString());
  values.push(id);

  await this.db.run(
    `UPDATE conversations SET ${fields.join(", ")} WHERE id = ?`,
    values
  );

  return this.get(id);
}
```

## Acceptance Criteria

### CREATE Operations

- [ ] Repository `create()` method explicitly sets `chat_mode: 'round-robin'` for new conversations
- [ ] INSERT SQL includes chat_mode column with proper parameterization
- [ ] New conversations have 'round-robin' mode regardless of database default
- [ ] Create operations handle the chat_mode field without errors

### SELECT Operations

- [ ] All conversation queries include chat_mode field in SELECT statements
- [ ] `get()` method returns conversations with chat_mode field
- [ ] `list()` method returns conversations with chat_mode field
- [ ] Query performance is not degraded by chat_mode inclusion

### UPDATE Operations

- [ ] Repository `update()` method supports updating chat_mode field via `UpdateConversationInput`
- [ ] Dynamic UPDATE queries handle chat_mode field appropriately
- [ ] Partial updates work correctly (chat_mode only, title only, combined)
- [ ] Transaction safety maintained for all update operations
- [ ] Updated conversations returned with correct chat_mode values

### Data Integrity

- [ ] Database constraints prevent invalid chat_mode values (leverages existing schema validation)
- [ ] Parameterized queries prevent SQL injection
- [ ] Naming consistency uses 'round-robin' (with hyphen) throughout

### Unit Testing

- [ ] Comprehensive test cases for chat_mode CREATE operations
- [ ] Test coverage for chat_mode SELECT operations in get() and list()
- [ ] Test coverage for chat_mode UPDATE operations (partial and combined)
- [ ] Test cases for edge conditions and error scenarios
- [ ] All existing tests continue to pass with chat_mode additions

## Security Considerations

- **SQL Injection Prevention**: Use parameterized queries for all database operations
- **Input Validation**: Rely on existing Zod schema validation in service layer
- **Data Integrity**: Ensure database constraints prevent invalid chat_mode values

## Performance Requirements

- **Query Performance**: No regression in existing conversation loading performance
- **Update Speed**: Conversation updates should complete within existing performance targets
- **Database Efficiency**: Minimal additional database load from new field

## Implementation Notes

### Existing Patterns to Follow

- Follow existing repository patterns for error handling and transaction management
- Use existing database connection and query execution patterns
- Maintain consistent method signatures and return types
- Follow existing test patterns and structure

### Error Handling

- Use existing repository error handling patterns
- Ensure proper error propagation to service layer
- Handle database constraint violations appropriately

## Testing Strategy

### Unit Tests Required

- Test chat_mode handling in all CRUD operations
- Test new conversation default behavior ('round-robin' mode)
- Test partial updates (chat_mode only, title only, combined updates)
- Test edge cases and error conditions
- Verify all existing functionality continues working

### Integration Considerations

- Repository changes support service layer integration
- Database operations remain atomic and consistent
- Maintain backward compatibility with existing data

## Dependencies

- Database schema with chat_mode column (completed in F-database-schema-and-core-types)
- UpdateConversationInput type with chat_mode field (completed in F-database-schema-and-core-types)
- Conversation type with chat_mode field (completed in F-database-schema-and-core-types)

## Out of Scope

- Service layer implementation (handled in separate task)
- IPC adapter changes (handled in separate task)
- UI integration or user-facing changes
- Performance optimizations beyond maintaining current levels
- Database migration or schema changes (already completed)
