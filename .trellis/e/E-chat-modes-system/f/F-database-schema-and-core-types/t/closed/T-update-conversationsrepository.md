---
id: T-update-conversationsrepository
title: Update ConversationsRepository for chat_mode CRUD operations
status: done
priority: medium
parent: F-database-schema-and-core-types
prerequisites:
  - T-create-database-migration-for
  - T-update-conversation-interface
  - T-update-zod-schemas-for-chat
affectedFiles:
  packages/shared/src/repositories/conversations/ConversationsRepository.ts:
    "Updated all CRUD methods to properly handle chat_mode field: CREATE method
    includes chat_mode in INSERT SQL with 'round-robin' default, GET and LIST
    methods include chat_mode in SELECT queries, UPDATE method handles chat_mode
    parameter in dynamic SQL generation"
  packages/shared/src/repositories/conversations/__tests__/ConversationsRepository.test.ts:
    Updated all test cases to include chat_mode field in mock data and
    expectations, added comprehensive test cases for chat_mode-specific
    operations including chat_mode-only updates and combined title+chat_mode
    updates, fixed SQL query expectations to include chat_mode column
log:
  - >-
    Successfully updated ConversationsRepository for complete chat_mode CRUD
    operations. All repository methods now properly handle the chat_mode field:


    ✅ CREATE method: Sets 'round-robin' as default for new conversations and
    includes chat_mode in INSERT SQL

    ✅ GET method: Includes chat_mode in SELECT query and returns it in results  

    ✅ LIST method: Includes chat_mode in SELECT query and returns it in results

    ✅ UPDATE method: Accepts chat_mode in UpdateConversationInput and includes
    it in UPDATE SQL when provided

    ✅ Comprehensive test coverage: Added specific test cases for chat_mode
    updates, combined updates, and validation

    ✅ All tests passing (43/43) with proper mock data including chat_mode fields

    ✅ Quality checks passing: lint, type-check, and format all successful


    The repository now fully integrates with the database migration and type
    system updates, providing complete CRUD support for chat modes while
    maintaining backward compatibility.
schema: v1.0
childrenIds: []
created: 2025-09-03T18:55:48.601Z
updated: 2025-09-03T18:55:48.601Z
---

# Update ConversationsRepository for chat_mode CRUD Operations

## Context

Integrate chat_mode field into all ConversationsRepository CRUD operations, ensuring database operations handle the new column properly. This task builds on the database migration, type updates, and schema validation to provide complete repository-layer support.

## Implementation Requirements

### Repository Methods to Update

- **File**: `packages/shared/src/repositories/conversations/ConversationsRepository.ts`
- **Methods**: create, get, list, update (following existing patterns from repository analysis)
- **Approach**: Follow existing repository patterns for column handling

### CREATE Method Updates

- **New Conversation Default**: Set `chat_mode: 'round-robin'` for new conversations (per epic requirements)
- **SQL Query**: Include chat_mode in INSERT statement
- **Type Safety**: Use updated Conversation interface

```typescript
async create(input: { title: string; chat_mode?: 'manual' | 'round-robin' }): Promise<Conversation> {
  // Implementation follows existing create method pattern
  // Default to 'round-robin' for new conversations per epic requirements
}
```

### SELECT Method Updates (get, list)

- **Column Inclusion**: Add chat_mode to SELECT statements
- **Result Mapping**: Include chat_mode in row-to-object mapping
- **Consistency**: Update both get() and list() methods uniformly

```typescript
private readonly selectColumns = 'id, title, chat_mode, created_at, updated_at';
```

### UPDATE Method Updates

- **Input Support**: Accept UpdateConversationInput with optional chat_mode
- **SQL Generation**: Include chat_mode in UPDATE SET clause when provided
- **Validation**: Use updated schemas for input validation

### Testing Requirements (Unit Tests)

- **Create Operations**: Verify new conversations get 'round-robin' default
- **Read Operations**: Confirm chat_mode returned in get/list results
- **Update Operations**: Test chat_mode updates work correctly
- **Migration Compatibility**: Ensure existing conversations work with 'manual' mode
- **Type Safety**: Verify repository methods use updated interfaces
- **Error Handling**: Test invalid chat_mode values rejected appropriately

## Acceptance Criteria

- [ ] create() method sets chat_mode to 'round-robin' for new conversations by default
- [ ] All SELECT queries include chat_mode column in results
- [ ] get() and list() methods return chat_mode field in Conversation objects
- [ ] update() method accepts UpdateConversationInput with optional chat_mode field
- [ ] Repository methods use updated TypeScript interfaces and Zod schemas
- [ ] Unit tests verify all CRUD operations handle chat_mode correctly (>90% coverage)
- [ ] Existing conversations continue working with 'manual' mode after repository updates

## Files to Modify

- `packages/shared/src/repositories/conversations/ConversationsRepository.ts`

## Dependencies

- T-create-database-migration-for (database schema must exist)
- T-update-conversation-interface (TypeScript interfaces needed)
- T-update-zod-schemas-for-chat (validation schemas needed)

## Security Considerations

- **SQL Injection**: Use parameterized queries for all chat_mode operations
- **Input Validation**: Leverage Zod schemas to validate chat_mode input
- **Data Integrity**: Ensure chat_mode values match database constraints

## Out of Scope

- Service layer integration (handled by other features)
- IPC adapter updates (handled by service layer tasks)
- UI integration (handled by UI feature tasks)
