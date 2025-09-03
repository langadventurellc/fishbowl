---
id: T-update-zod-schemas-for-chat
title: Update Zod schemas for chat_mode validation
status: open
priority: high
parent: F-database-schema-and-core-types
prerequisites:
  - T-update-conversation-interface
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-03T18:55:31.199Z
updated: 2025-09-03T18:55:31.199Z
---

# Update Zod Schemas for chat_mode Validation

## Context

Implement Zod schema validation for the chat_mode field to ensure runtime type safety and input validation. This builds on the updated Conversation interface and provides comprehensive validation for both conversation creation and updates.

## Implementation Requirements

### Conversation Schema Update

- **File**: `packages/shared/src/types/conversations/schemas/conversationSchema.ts`
- **Field Addition**: Add chat_mode field with enum validation and default value
- **Consistent Naming**: Use exact literal `'manual' | 'round-robin'` (with hyphen)

### Implementation Pattern

```typescript
import { z } from "zod";

export const conversationSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  chat_mode: z.enum(["manual", "round-robin"]).default("manual"),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type ConversationSchema = z.infer<typeof conversationSchema>;
```

### Update Conversation Input Schema Creation

- **File**: `packages/shared/src/types/conversations/schemas/updateConversationInputSchema.ts`
- **Purpose**: Validate chat_mode updates from UI and service layer
- **Optional Fields**: All fields optional for partial updates

```typescript
import { z } from "zod";

export const updateConversationInputSchema = z.object({
  title: z.string().min(1).optional(),
  chat_mode: z.enum(["manual", "round-robin"]).optional(),
});

export type UpdateConversationInputSchema = z.infer<
  typeof updateConversationInputSchema
>;
```

### Testing Requirements (Unit Tests)

- **Valid Values**: Test schema accepts 'manual' and 'round-robin'
- **Invalid Values**: Test schema rejects invalid chat_mode values ('invalid', null, undefined when required)
- **Default Behavior**: Verify 'manual' default applies correctly
- **Update Schema**: Test optional validation works for partial updates
- **Type Inference**: Confirm z.infer types match TypeScript interfaces
- **Error Messages**: Verify meaningful validation error messages

## Acceptance Criteria

- [ ] conversationSchema includes chat_mode field with z.enum(['manual', 'round-robin']).default('manual')
- [ ] updateConversationInputSchema includes optional chat_mode field with same enum validation
- [ ] Schema validation correctly accepts valid values ('manual', 'round-robin')
- [ ] Schema validation correctly rejects invalid values with meaningful error messages
- [ ] Default value 'manual' applies when chat_mode not provided
- [ ] Unit tests verify all validation scenarios with >95% coverage
- [ ] Schemas properly exported via barrel exports

## Files to Modify/Create

- `packages/shared/src/types/conversations/schemas/conversationSchema.ts`
- `packages/shared/src/types/conversations/schemas/updateConversationInputSchema.ts` (create)
- `packages/shared/src/types/conversations/schemas/index.ts` (update exports)

## Dependencies

- T-update-conversation-interface (TypeScript interfaces must exist first)

## Security Considerations

- **Input Validation**: Zod schemas prevent injection of invalid chat_mode values
- **Runtime Safety**: Schema validation catches type errors at runtime
- **Error Handling**: Clear validation errors prevent silent failures

## Out of Scope

- Repository layer integration (handled by separate task)
- Service layer validation (handled by other features)
- UI form validation (handled by UI components)
