---
id: T-update-conversation-interface
title: Update Conversation interface and core type definitions
status: done
priority: high
parent: F-database-schema-and-core-types
prerequisites: []
affectedFiles:
  packages/shared/src/types/conversations/Conversation.ts: Added required
    chat_mode field with 'manual' | 'round-robin' literal union type and
    comprehensive JSDoc documentation explaining manual vs round-robin behavior
  packages/shared/src/types/conversations/UpdateConversationInput.ts:
    Added optional chat_mode field with same literal union type to support
    conversation chat mode updates via repository/service layer
  packages/shared/src/types/conversations/__tests__/types.test.ts:
    Extended existing tests with comprehensive chat_mode field validation
    including type safety, field requirements, literal type constraints, and
    UpdateConversationInput tests
  packages/shared/src/repositories/conversations/ConversationsRepository.ts:
    Updated repository to handle new required chat_mode field with temporary
    manual construction until schema validation is updated, added default values
    for backward compatibility
  packages/shared/src/repositories/conversations/__tests__/ConversationsRepository.test.ts:
    Fixed mock conversation objects and test expectations to include required
    chat_mode field, separated database row mocks from expected results to
    account for repository adding chat_mode field
  packages/shared/src/repositories/conversations/__tests__/ConversationsRepositoryInterface.test.ts:
    Updated all mock conversation objects in interface compliance tests to
    include chat_mode field
  packages/shared/src/repositories/conversations/__tests__/exports.test.ts: Fixed mock conversation object to include required chat_mode field
  packages/ui-shared/src/stores/conversation/__tests__/selectors.test.ts:
    Updated createMockConversation factory function to include chat_mode field
    for test compatibility
log:
  - 'Successfully updated the core Conversation interface and
    UpdateConversationInput type definitions to include chat_mode field,
    establishing TypeScript foundation for chat modes functionality. Added
    required `chat_mode: "manual" | "round-robin"` field to Conversation
    interface with comprehensive JSDoc documentation. Created optional
    `chat_mode?: "manual" | "round-robin"` field in UpdateConversationInput
    interface. Added comprehensive unit tests validating type safety, field
    requirements, and literal types. Fixed all compilation errors across
    repository and test files by updating mock objects and temporarily handling
    schema validation until Zod schemas are updated by separate task. Updated
    all failing repository tests to account for new chat_mode field
    expectations. All quality checks pass including linting, formatting, type
    checking, and unit tests.'
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
