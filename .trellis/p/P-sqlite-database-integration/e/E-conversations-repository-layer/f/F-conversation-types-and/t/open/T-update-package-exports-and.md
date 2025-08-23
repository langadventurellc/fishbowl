---
id: T-update-package-exports-and
title: Update package exports and integration
status: open
priority: low
parent: F-conversation-types-and
prerequisites:
  - T-create-core-conversation
  - T-implement-zod-validation
  - T-create-custom-error-classes
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-23T06:30:05.632Z
updated: 2025-08-23T06:30:05.632Z
---

# Update Package Exports and Integration

## Context

Complete the conversation types feature by updating all necessary barrel exports and ensuring proper integration with the shared package structure. This ensures all types are accessible where needed.

Reference:

- `packages/shared/src/types/index.ts` for main types export
- `packages/shared/src/index.ts` for package-level exports

## Implementation Requirements

### 1. Create Main Conversations Barrel Export

File: `packages/shared/src/types/conversations/index.ts`

```typescript
// Type definitions
export type { Conversation } from "./Conversation";
export type { CreateConversationInput } from "./CreateConversationInput";
export type { UpdateConversationInput } from "./UpdateConversationInput";
export type { ConversationResult } from "./ConversationResult";

// Schemas
export {
  conversationSchema,
  createConversationInputSchema,
  updateConversationInputSchema,
} from "./schemas";

// Inferred types from schemas
export type {
  ConversationSchema,
  CreateConversationInputSchema,
  UpdateConversationInputSchema,
} from "./schemas";

// Error classes
export {
  ConversationNotFoundError,
  ConversationValidationError,
} from "./errors";
```

### 2. Update Types Package Export

File: `packages/shared/src/types/index.ts`
Add to existing exports:

```typescript
// Conversations
export * from "./conversations";
```

### 3. Update Main Package Export (if needed)

File: `packages/shared/src/index.ts`
Verify conversations types are accessible through main export

### 4. Verify Build and Type Checking

- Run `pnpm build:libs` to ensure types compile
- Run `pnpm type-check` to verify no type errors
- Run `pnpm quality` to ensure code quality

## Technical Approach

1. Create comprehensive barrel export for conversations
2. Use `export type` for interfaces, `export` for runtime code
3. Group exports logically with comments
4. Update parent barrel files
5. Verify all exports are accessible

## Acceptance Criteria

- ✓ All conversation types exported through barrel files
- ✓ Proper use of `export type` vs `export`
- ✓ Types accessible from `@fishbowl-ai/shared`
- ✓ No circular dependencies
- ✓ Build completes successfully
- ✓ Type checking passes
- ✓ Quality checks pass

## Testing Requirements

Create export verification test:
File: `packages/shared/src/types/conversations/__tests__/exports.test.ts`

- Verify all expected exports are available
- Test type imports work correctly
- Ensure no runtime code in type exports
- Check for circular dependencies

Run existing test suites:

- `pnpm test` to run all unit tests
- Verify no regressions in existing tests

## Security Considerations

- Ensure error classes don't expose sensitive internals
- Verify no accidental export of internal utilities
- Keep exports minimal and intentional
