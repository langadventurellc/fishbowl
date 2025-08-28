---
id: T-implement-message-typescript
title: Implement message TypeScript types and Zod validation schemas
status: open
priority: high
parent: F-chat-system-data-foundation
prerequisites:
  - T-create-messages-table
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-28T03:47:53.878Z
updated: 2025-08-28T03:47:53.878Z
---

# Implement Message TypeScript Types and Zod Validation Schemas

## Overview

Create comprehensive TypeScript type definitions and Zod validation schemas for the messages system, following established patterns from the existing conversation types and ensuring full type safety across the application.

## Context

- **Feature**: F-chat-system-data-foundation - Chat System Data Foundation
- **Prerequisites**: Database migration `T-create-messages-table` must be completed
- **Pattern Reference**: Follow patterns from `packages/shared/src/types/conversations/`
- **Validation Library**: Zod for runtime type validation and schema definition
- **Integration**: Types must be consumable by both desktop and future mobile platforms

## Technical Requirements

### 1. Message Core Types

Create the foundational message types in `packages/shared/src/types/messages/Message.ts` (interface only; schemas live under `schemas/`):

#### Message Interface

```typescript
export interface Message {
  /** Unique identifier (UUID v4) */
  id: string;
  /** Foreign key to conversations table */
  conversation_id: string;
  /** Foreign key to conversation_agents table (nullable for user/system messages) */
  conversation_agent_id: string | null;
  /** Message role in the conversation */
  role: MessageRole;
  /** Message content with no length restrictions */
  content: string;
  /** Whether message should be included in LLM context */
  included: boolean;
  /** ISO 8601 timestamp of creation */
  created_at: string;
}
```

#### Message Role Enum

```typescript
export const MessageRole = {
  USER: "user",
  AGENT: "agent", // Use 'agent' consistently, never 'assistant'
  SYSTEM: "system",
} as const;

export type MessageRole = (typeof MessageRole)[keyof typeof MessageRole];
```

### 2. Zod Validation Schemas

Implement comprehensive Zod schemas for runtime validation under `packages/shared/src/types/messages/schemas/`:

#### Message Schema (`schemas/MessageSchema.ts`)

```typescript
export const MessageSchema = z
  .object({
    id: z.string().uuid("Invalid message ID format"),
    conversation_id: z.string().uuid("Invalid conversation ID format"),
    conversation_agent_id: z
      .string()
      .uuid("Invalid conversation agent ID format")
      .nullable(),
    role: z.enum(["user", "agent", "system"], {
      errorMap: () => ({ message: "Role must be user, agent, or system" }),
    }),
    content: z.string().min(1, "Message content cannot be empty"),
    included: z.boolean(),
    created_at: z.string().datetime("Invalid timestamp format"),
  })
  .refine(
    (data) =>
      data.role === "agent"
        ? data.conversation_agent_id !== null
        : data.conversation_agent_id === null,
    {
      message:
        "conversation_agent_id must be present for agent messages and null otherwise",
      path: ["conversation_agent_id"],
    },
  );
```

### 3. Input and Update Types

Create specialized types for different operations:

#### Create Message Input Type (`packages/shared/src/types/messages/MessageInput.ts` + `schemas/CreateMessageInputSchema.ts`)

```typescript
export interface CreateMessageInput {
  conversation_id: string;
  conversation_agent_id?: string; // required for agent messages; omit for user/system
  role: MessageRole;
  content: string;
  included?: boolean; // Optional, defaults to true
}

export const CreateMessageInputSchema = z
  .object({
    conversation_id: z.string().uuid(),
    conversation_agent_id: z.string().uuid().optional(),
    role: z.enum(["user", "agent", "system"]),
    content: z.string().min(1), // No max length constraint - UI handles limits
    included: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.role === "agent"
        ? typeof data.conversation_agent_id === "string"
        : data.conversation_agent_id === undefined,
    {
      message:
        "conversation_agent_id is required for agent role and must be omitted for user/system roles",
      path: ["conversation_agent_id"],
    },
  );
```

#### Update Message Inclusion Input Type (`packages/shared/src/types/messages/UpdateMessageInclusionInput.ts`)

```typescript
export interface UpdateMessageInclusionInput {
  id: string;
  included: boolean;
}

export const UpdateMessageInclusionInputSchema = z.object({
  id: z.string().uuid(),
  included: z.boolean(),
});
```

## Implementation Steps

### Step 1: Create Message Types Directory Structure

1. Create `packages/shared/src/types/messages/` directory
2. Add `schemas/` and `errors/` subdirectories following existing patterns
3. Set up barrel export structure (`types/messages/index.ts`) and update `types/index.ts`
4. Create individual files per type/schema/error for clean separation of concerns

### Step 2: Implement Core Message Types

1. Create `Message.ts` with interface and role enum definitions
2. Add comprehensive JSDoc documentation for all fields
3. Export MessageRole enum for external consumption
4. Implement Zod schema in `schemas/MessageSchema.ts` with conditional agent-id rule

### Step 3: Create Input Type Definitions

1. Create `MessageInput.ts` for message creation inputs
2. Create `UpdateMessageInclusionInput.ts` for inclusion toggle operations
3. Implement corresponding Zod schemas for runtime validation
4. Ensure no content length constraints at type level

### Step 4: Set Up Barrel Exports & Errors

1. Create `packages/shared/src/types/messages/index.ts` with all exports (types, schemas, errors)
2. Update `packages/shared/src/types/index.ts` to include message exports
3. Add `errors/MessageNotFoundError.ts` and `errors/MessageValidationError.ts` mirroring existing error class patterns
4. Ensure clean import paths for consuming applications

### Step 5: Write Unit Tests

1. Create `packages/shared/src/types/messages/__tests__/` directory
2. Test Zod schema validation with valid and invalid inputs
3. Test TypeScript type compatibility and inference
4. Verify enum values and type safety

## File Organization

```
packages/shared/src/types/messages/
├── Message.ts                          # Core Message interface
├── MessageInput.ts                     # Create message input type
├── UpdateMessageInclusionInput.ts      # Inclusion update input type
├── errors/
│   ├── MessageNotFoundError.ts
│   └── MessageValidationError.ts
├── schemas/
│   ├── MessageSchema.ts
│   ├── CreateMessageInputSchema.ts
│   └── UpdateMessageInclusionInputSchema.ts
├── index.ts                           # Barrel exports
└── __tests__/
    ├── Message.test.ts                # Message type and schema tests
    ├── MessageInput.test.ts           # Input type validation tests
    └── UpdateMessageInclusionInput.test.ts # Update input tests
```

## Testing Requirements

### Unit Test Coverage

Create comprehensive tests for:

#### Type Validation Tests (`Message.test.ts`)

```typescript
describe("MessageSchema validation", () => {
  it("should validate valid message objects", () => {
    const validMessage = {
      id: "11111111-1111-1111-1111-111111111111",
      conversation_id: "22222222-2222-2222-2222-222222222222",
      conversation_agent_id: "33333333-3333-3333-3333-333333333333",
      role: "user",
      content: "Hello world",
      included: true,
      created_at: "2024-01-01T00:00:00Z",
    };
    expect(() => MessageSchema.parse(validMessage)).not.toThrow();
  });

  it("should reject invalid role values", () => {
    const invalidMessage = { /* ... */ role: "assistant" };
    expect(() => MessageSchema.parse(invalidMessage)).toThrow();
  });
});
```

#### Input Validation Tests (`MessageInput.test.ts`)

```typescript
describe("CreateMessageInputSchema validation", () => {
  it("should allow messages without length limits", () => {
    const longContent = "a".repeat(10000);
    const input = {
      conversation_id: "22222222-2222-2222-2222-222222222222",
      role: "user",
      content: longContent,
    };
    expect(() => CreateMessageInputSchema.parse(input)).not.toThrow();
  });
});
```

## Acceptance Criteria

### Type System Completeness

- ✅ Message interface defined with all required fields and JSDoc documentation
- ✅ MessageRole enum exported with 'user', 'agent', 'system' values (no 'assistant')
- ✅ CreateMessageInput type supports message creation without length constraints and enforces role-based agent-id rule
- ✅ UpdateMessageInclusionInput type supports inclusion state changes
- ✅ All types exported from shared package index for platform consumption

### Zod Schema Validation

- ✅ MessageSchema validates all fields with appropriate constraints
- ✅ UUID validation for id fields using `z.string().uuid()`
- ✅ Role enum validation rejects invalid values
- ✅ Content validation requires non-empty strings without max length
- ✅ Conditional validation for `conversation_agent_id` based on role
- ✅ Boolean and datetime validation with proper error messages

### Integration Compatibility

- ✅ Types follow existing codebase patterns and naming conventions
- ✅ Clean barrel export structure for easy importing
- ✅ No platform-specific code or dependencies
- ✅ TypeScript inference works correctly for all types
- ✅ Zod schemas provide runtime safety for API boundaries
- ✅ Error classes (`MessageNotFoundError`, `MessageValidationError`) available for repository usage

### Test Coverage Standards

- ✅ Unit tests cover all type validation scenarios
- ✅ Tests verify Zod schema rejection of invalid inputs
- ✅ Tests confirm TypeScript type compatibility
- ✅ Test files follow existing naming and structure conventions
- ✅ All tests pass linting, formatting, and type checking

## Security Considerations

- **Input Validation**: Zod schemas prevent invalid data from entering the system
- **Type Safety**: TypeScript ensures compile-time type checking
- **UUID Validation**: Proper UUID format validation for foreign key integrity
- **Content Handling**: No server-side content length limits (client-side only)

## Dependencies

- **Database Schema**: T-create-messages-table (database migration must be completed)
- **Zod Library**: For runtime validation and schema definition
- **Existing Type Patterns**: Follow conventions from conversation types
- **UUID Utilities**: Use existing UUID validation patterns

## Out of Scope

- No repository layer implementation (separate task)
- No UI form validation or React integration
- No API endpoint implementation
- No state management or Zustand store integration
- No LLM provider type definitions
