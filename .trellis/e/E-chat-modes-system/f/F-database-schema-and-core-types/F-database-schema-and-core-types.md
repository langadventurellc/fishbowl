---
id: F-database-schema-and-core-types
title: Database Schema and Core Types
status: open
priority: medium
parent: E-chat-modes-system
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-03T18:33:40.238Z
updated: 2025-09-03T18:33:40.238Z
---

# Database Schema and Core Types Feature

## Overview

Establish the foundational infrastructure for chat modes by adding database schema support and updating core TypeScript types. This feature provides the data layer foundation that all other chat mode features depend on.

## Functionality

### Database Schema Updates

- Add `chat_mode` column to conversations table with proper migration
- Ensure backward compatibility with existing conversations
- Follow existing migration patterns and standards

### Type System Updates

- Update `Conversation` interface to include `chat_mode` field
- Update Zod schemas for validation
- Create `UpdateConversationInput` type support
- Ensure consistent naming across all type definitions

## Acceptance Criteria

### Database Migration

- [ ] **Migration File Created**: `migrations/004_add_chat_mode_to_conversations.sql` follows existing naming and format conventions
- [ ] **Column Addition**: `ALTER TABLE conversations ADD COLUMN chat_mode VARCHAR DEFAULT 'manual' NOT NULL`
- [ ] **Backward Compatibility**: Existing conversations retain 'manual' mode from database default
- [ ] **Migration Safety**: Uses idempotent SQL patterns with proper error handling
- [ ] **Documentation**: Migration includes comprehensive comments explaining purpose and rollback instructions
- [ ] **Naming Consistency**: Uses 'round-robin' (with hyphen) consistently in all references

### Type Definitions

- [ ] **Conversation Interface**: Updated to include `chat_mode: 'manual' | 'round-robin'` field
- [ ] **Schema Validation**: `conversationSchema.ts` validates chat_mode field with proper Zod constraints using 'round-robin'
- [ ] **Update Input Types**: `UpdateConversationInput.ts` includes optional `chat_mode` field
- [ ] **Update Input Schema**: `updateConversationInputSchema.ts` validates chat_mode updates with 'round-robin'
- [ ] **Consistent Naming**: All type definitions use exact literal `'manual' | 'round-robin'` (with hyphen)

### Repository Integration

- [ ] **SELECT Queries**: All repository SELECT queries include chat_mode column in results
- [ ] **CREATE Method**: Repository `create()` method updated to insert chat_mode field
- [ ] **UPDATE Method**: Repository `update()` method handles chat_mode field updates
- [ ] **Type Safety**: Repository methods use updated types with chat_mode field

### Integration Requirements

- [ ] **Type Safety**: All existing conversation-related code compiles without type errors
- [ ] **Default Values**: New conversation creation handles chat_mode appropriately
- [ ] **Validation**: Invalid chat_mode values rejected by schema validation
- [ ] **Export Consistency**: All new types properly exported from index files

## Implementation Guidance

### Migration Implementation

```sql
-- Migration: Add chat_mode column to conversations table
-- Description: Adds chat mode support for Manual and Round Robin conversation modes
ALTER TABLE conversations
ADD COLUMN chat_mode VARCHAR DEFAULT 'manual' NOT NULL;

-- Note: No index added initially per KISS/YAGNI principles
-- Index can be added later if mode-based queries become necessary
```

### Type Implementation Patterns

```typescript
// Conversation interface update
export interface Conversation {
  // ... existing fields
  chat_mode: "manual" | "round-robin";
}

// Zod schema update
export const conversationSchema = z.object({
  // ... existing fields
  chat_mode: z.enum(["manual", "round-robin"]).default("manual"),
});

// UpdateConversationInput extension
export interface UpdateConversationInput {
  title?: string;
  chat_mode?: "manual" | "round-robin";
}

// UpdateConversationInput schema
export const updateConversationInputSchema = z.object({
  title: z.string().optional(),
  chat_mode: z.enum(["manual", "round-robin"]).optional(),
});
```

### Repository SELECT Updates

```typescript
// Ensure all SELECT queries include chat_mode column
const selectColumns = 'id, title, chat_mode, created_at, updated_at';

// List conversations
async list(): Promise<Conversation[]> {
  const rows = await this.db.all(`SELECT ${selectColumns} FROM conversations ORDER BY created_at DESC`);
  return rows.map(row => this.mapRowToConversation(row));
}

// Get conversation by ID
async get(id: string): Promise<Conversation | null> {
  const row = await this.db.get(`SELECT ${selectColumns} FROM conversations WHERE id = ?`, [id]);
  return row ? this.mapRowToConversation(row) : null;
}
```

### Testing Requirements

- [ ] **Migration Testing**: Verify migration runs successfully on existing database
- [ ] **Type Testing**: Unit tests for schema validation with valid/invalid chat_mode values
- [ ] **Rollback Testing**: Ensure migration can be safely reversed if needed
- [ ] **Integration Testing**: Verify existing conversation loading still works
- [ ] **Repository Testing**: All CRUD operations handle chat_mode field correctly

### Files to Modify

- `migrations/004_add_chat_mode_to_conversations.sql` (new)
- `packages/shared/src/types/conversations/Conversation.ts`
- `packages/shared/src/types/conversations/schemas/conversationSchema.ts`
- `packages/shared/src/types/conversations/UpdateConversationInput.ts`
- `packages/shared/src/types/conversations/schemas/updateConversationInputSchema.ts`
- `packages/shared/src/repositories/conversations/ConversationsRepository.ts`

### Security Considerations

- **Input Validation**: Zod schemas prevent invalid chat_mode values
- **SQL Injection**: Migration uses parameterized SQL patterns
- **Data Integrity**: NOT NULL constraint ensures all conversations have valid modes

### Performance Requirements

- **Migration Speed**: Should complete in <1 second for typical database sizes
- **Query Performance**: New column should not impact existing query performance
- **Memory Usage**: Type definitions should not increase bundle size significantly

## Dependencies

- None (foundational feature)

## Success Metrics

- [ ] Migration runs successfully on existing databases
- [ ] All existing TypeScript code compiles without errors
- [ ] Schema validation correctly accepts/rejects chat_mode values with 'round-robin'
- [ ] No performance regression in conversation loading
- [ ] Repository methods properly handle chat_mode in all CRUD operations
