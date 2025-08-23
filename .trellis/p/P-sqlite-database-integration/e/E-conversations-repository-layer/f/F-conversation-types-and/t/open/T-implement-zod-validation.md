---
id: T-implement-zod-validation
title: Implement Zod validation schemas
status: open
priority: high
parent: F-conversation-types-and
prerequisites:
  - T-create-core-conversation
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-23T06:29:18.345Z
updated: 2025-08-23T06:29:18.345Z
---

# Implement Zod Validation Schemas

## Context

Create Zod schemas for runtime validation of conversation data. These schemas enforce business rules and provide type safety at runtime.

Reference existing patterns:

- `packages/shared/src/types/llmConfig/llmConfigSchema.ts` for schema patterns
- `packages/shared/src/types/settings/generalSettingsSchema.ts` for validation approaches

## Implementation Requirements

### 1. Create Conversation Schema

File: `packages/shared/src/types/conversations/schemas/conversationSchema.ts`

```typescript
import { z } from "zod";

export const conversationSchema = z.object({
  id: z.string().uuid("ID must be a valid UUID"),
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(255, "Title cannot exceed 255 characters")
    .trim(),
  created_at: z.string().datetime({ message: "Invalid creation timestamp" }),
  updated_at: z.string().datetime({ message: "Invalid update timestamp" }),
});

export type ConversationSchema = z.infer<typeof conversationSchema>;
```

### 2. Create Input Schemas

File: `packages/shared/src/types/conversations/schemas/createConversationInputSchema.ts`

```typescript
import { z } from "zod";

export const createConversationInputSchema = z.object({
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(255, "Title cannot exceed 255 characters")
    .trim()
    .optional(),
});

export type CreateConversationInputSchema = z.infer<
  typeof createConversationInputSchema
>;
```

File: `packages/shared/src/types/conversations/schemas/updateConversationInputSchema.ts`

```typescript
import { z } from "zod";

export const updateConversationInputSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title cannot be empty")
      .max(255, "Title cannot exceed 255 characters")
      .trim()
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type UpdateConversationInputSchema = z.infer<
  typeof updateConversationInputSchema
>;
```

### 3. Create Schema Barrel Export

File: `packages/shared/src/types/conversations/schemas/index.ts`

- Export all schemas and their inferred types
- Group exports logically

## Technical Approach

1. Import Zod library
2. Create schemas with proper validation rules
3. Add custom error messages for each validation
4. Use `.trim()` to sanitize string inputs
5. Export both schema and inferred type

## Acceptance Criteria

- ✓ All schemas created with proper validation rules
- ✓ Custom error messages for each validation failure
- ✓ Title validation: 1-255 characters, trimmed
- ✓ UUID validation for ID field
- ✓ ISO datetime validation for timestamps
- ✓ Update schema requires at least one field
- ✓ Inferred types exported alongside schemas

## Testing Requirements

Create comprehensive unit tests:

- File: `packages/shared/src/types/conversations/schemas/__tests__/conversationSchema.test.ts`
- Test valid inputs pass validation
- Test invalid inputs with specific error messages
- Test edge cases (empty strings, max length, whitespace)

File: `packages/shared/src/types/conversations/schemas/__tests__/createConversationInputSchema.test.ts`

- Test optional title behavior
- Test title validation rules
- Test trimming of whitespace

File: `packages/shared/src/types/conversations/schemas/__tests__/updateConversationInputSchema.test.ts`

- Test partial update validation
- Test empty object rejection
- Test field validation rules

## Security Considerations

- Trim all string inputs to prevent whitespace attacks
- Validate UUID format to prevent injection
- Enforce max length to prevent DoS
- Clear error messages without exposing internals
