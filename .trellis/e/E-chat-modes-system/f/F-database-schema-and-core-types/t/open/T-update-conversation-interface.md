---
id: T-update-conversation-interface
title: Update Conversation interface and core type definitions
status: open
priority: high
parent: F-database-schema-and-core-types
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-03T18:55:14.507Z
updated: 2025-09-03T18:55:14.507Z
---

# Update Conversation Interface and Core Type Definitions

## Context

Update the core Conversation interface to include the chat_mode field, establishing the TypeScript foundation for chat modes functionality. This task follows the database migration and provides type safety for the new chat_mode column.

## Implementation Requirements

### Conversation Interface Update

- **File**: `packages/shared/src/types/conversations/Conversation.ts`
- **Field Addition**: Add `chat_mode: 'manual' | 'round-robin'` field to existing interface
- **Consistent Naming**: Use exact literal `'manual' | 'round-robin'` (with hyphen) throughout
- **JSDoc**: Add comprehensive documentation for the new field

### Implementation Pattern

```typescript
export interface Conversation {
  /** Unique identifier (UUID v4) */
  id: string;
  /** Display title for the conversation */
  title: string;
  /** Chat mode controlling agent behavior: manual (user control) or round-robin (automatic rotation) */
  chat_mode: "manual" | "round-robin";
  /** ISO 8601 timestamp of creation */
  created_at: string;
  /** ISO 8601 timestamp of last update */
  updated_at: string;
}
```

### UpdateConversationInput Type Creation

- **File**: `packages/shared/src/types/conversations/UpdateConversationInput.ts`
- **Purpose**: Support chat_mode updates via repository/service layer
- **Implementation**: Include optional chat_mode field

```typescript
export interface UpdateConversationInput {
  title?: string;
  chat_mode?: "manual" | "round-robin";
}
```

### Testing Requirements (Unit Tests)

- **Type Compilation**: Verify TypeScript compiles without errors
- **Field Presence**: Test that chat_mode field is required in Conversation interface
- **Literal Types**: Confirm only 'manual' | 'round-robin' values accepted
- **Update Input**: Test UpdateConversationInput accepts optional chat_mode field
- **Import/Export**: Verify proper barrel exports work correctly

## Acceptance Criteria

- [ ] Conversation interface includes `chat_mode: 'manual' | 'round-robin'` field with JSDoc
- [ ] UpdateConversationInput interface includes optional `chat_mode?: 'manual' | 'round-robin'` field
- [ ] Consistent naming uses 'round-robin' (with hyphen) in all type definitions
- [ ] TypeScript compilation succeeds without errors
- [ ] Unit tests verify type safety and field requirements
- [ ] All files properly export new/updated interfaces via barrel exports

## Files to Modify/Create

- `packages/shared/src/types/conversations/Conversation.ts`
- `packages/shared/src/types/conversations/UpdateConversationInput.ts` (create if doesn't exist)
- `packages/shared/src/types/conversations/index.ts` (update exports)

## Dependencies

- Database migration task (T-create-database-migration-for) should be completed first for consistency

## Security Considerations

- **Type Safety**: Literal union types prevent invalid chat_mode values
- **Immutability**: Interface design prevents accidental mutations

## Out of Scope

- Zod schema validation (handled by separate task)
- Repository integration (handled by separate task)
- Service layer updates (handled by other features)
