---
id: F-conversation-types-and
title: Conversation Types and Validation
status: open
priority: medium
parent: E-conversations-repository-layer
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-23T06:20:47.000Z
updated: 2025-08-23T06:20:47.000Z
---

# Conversation Types and Validation

## Purpose and Functionality

Define the complete type system and validation schemas for the conversation domain model. This feature establishes the foundational data structures, TypeScript interfaces, and Zod validation schemas that will be used throughout the conversations feature, ensuring type safety and runtime validation.

## Key Components to Implement

### 1. TypeScript Interfaces

- `Conversation` interface with id, title, created_at, updated_at fields
- `CreateConversationInput` type for new conversation creation
- `UpdateConversationInput` type for conversation updates
- `ConversationResult` type with success/error states for operation results

### 2. Zod Validation Schemas

- `conversationSchema` for validating complete conversation objects
- `createConversationInputSchema` for validating creation inputs
- `updateConversationInputSchema` for validating update inputs
- Title validation rules (max 255 characters, non-empty when provided)

### 3. Custom Error Types

- `ConversationNotFoundError` extending base Error class
- `ConversationValidationError` for validation failures
- Error serialization support for IPC communication

### 4. Type Exports and Organization

- Barrel exports in index.ts files
- Proper separation of types vs runtime code
- JSDoc documentation for all public interfaces

## Detailed Acceptance Criteria

### Type Definitions

- ✓ Conversation interface includes all required fields (id: string, title: string, created_at: string, updated_at: string)
- ✓ CreateConversationInput allows optional title (defaults to "New Conversation")
- ✓ UpdateConversationInput supports partial updates with only title field
- ✓ ConversationResult uses discriminated union for success/error states
- ✓ All date fields use ISO 8601 string format for consistency

### Validation Rules

- ✓ Title must be between 1-255 characters when provided
- ✓ Title cannot be only whitespace
- ✓ ID field validates as UUID v4 format
- ✓ Timestamps validate as ISO date strings
- ✓ Schema includes proper error messages for validation failures

### Error Handling

- ✓ ConversationNotFoundError includes conversation ID in error message
- ✓ ConversationValidationError includes field-level error details
- ✓ Errors are serializable for IPC transport
- ✓ Error classes follow existing patterns in codebase

### Code Organization

- ✓ Types located in `packages/shared/src/types/conversations/`
- ✓ Errors located in `packages/shared/src/types/conversations/errors/`
- ✓ Schemas located in `packages/shared/src/types/conversations/schemas/`
- ✓ All exports available through barrel files

## Technical Requirements

### File Structure

```
packages/shared/src/types/conversations/
├── Conversation.ts
├── CreateConversationInput.ts
├── UpdateConversationInput.ts
├── ConversationResult.ts
├── errors/
│   ├── ConversationNotFoundError.ts
│   ├── ConversationValidationError.ts
│   └── index.ts
├── schemas/
│   ├── conversationSchema.ts
│   ├── createConversationInputSchema.ts
│   ├── updateConversationInputSchema.ts
│   └── index.ts
└── index.ts
```

### Dependencies

- Zod for runtime validation
- No external dependencies beyond what's already in shared package

## Implementation Guidance

1. Follow existing type patterns from `llmConfig` and `settings` types
2. Use Zod's `.brand()` or `.refine()` for custom validation rules
3. Ensure all types are exported with `export type` for proper tree-shaking
4. Include comprehensive JSDoc comments with examples
5. Consider future extensibility (messages, agents) but don't over-engineer

## Testing Requirements

### Unit Tests Required

- ✓ Zod schema validation with valid inputs
- ✓ Zod schema rejection of invalid inputs
- ✓ Error class construction and serialization
- ✓ Type inference tests using TypeScript's `expectType`
- ✓ Edge cases: empty strings, very long titles, invalid UUIDs

### Test Files

- `__tests__/conversationSchema.test.ts`
- `__tests__/createConversationInputSchema.test.ts`
- `__tests__/updateConversationInputSchema.test.ts`
- `__tests__/ConversationNotFoundError.test.ts`
- `__tests__/ConversationValidationError.test.ts`

## Security Considerations

- Validate all input to prevent SQL injection (even though we use parameterized queries)
- Sanitize title field to prevent XSS if displayed in UI
- Ensure UUID generation uses cryptographically secure methods

## Performance Requirements

- Schema validation should complete in <5ms for typical inputs
- Type checking should have zero runtime overhead
- Keep bundle size minimal with proper tree-shaking
