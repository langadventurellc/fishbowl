---
id: T-update-shared-package-exports
title: Update shared package exports
status: done
priority: medium
parent: F-service-integration
prerequisites:
  - T-integrate-repository-into
affectedFiles:
  packages/shared/src/repositories/conversations/index.ts: Added re-exports of
    conversation types (Conversation, CreateConversationInput,
    UpdateConversationInput, ConversationResult) and error classes
    (ConversationNotFoundError, ConversationValidationError) for convenience
    access
  packages/shared/src/services/index.ts: Added convenience exports of
    ConversationsRepositoryInterface and ConversationsRepository from
    repositories for easier access
  packages/shared/src/repositories/conversations/__tests__/exports.test.ts:
    Created comprehensive test suite verifying all exports are available,
    properly typed, and accessible from main package export with proper mocking
    of dependencies
log:
  - Updated shared package exports to properly expose ConversationsRepository
    and related types to desktop application. Added re-exports of conversation
    types to conversations/index.ts barrel file, included repositories in
    services/index.ts for convenience, and created comprehensive export test to
    verify all imports work correctly. All quality checks pass and exports are
    accessible from the main shared package.
schema: v1.0
childrenIds: []
created: 2025-08-23T06:33:28.566Z
updated: 2025-08-23T06:33:28.566Z
---

# Update Shared Package Exports

## Context

Ensure all conversation-related types, interfaces, and the repository are properly exported from the shared package. This makes them accessible to the desktop application.

## Implementation Requirements

### 1. Verify Conversations Repository Export

File: `packages/shared/src/repositories/conversations/index.ts`
Ensure exports:

```typescript
export type { ConversationsRepositoryInterface } from "./ConversationsRepositoryInterface";
export { ConversationsRepository } from "./ConversationsRepository";

// Re-export conversation types for convenience
export type {
  Conversation,
  CreateConversationInput,
  UpdateConversationInput,
  ConversationResult,
} from "../../types/conversations";

export {
  ConversationNotFoundError,
  ConversationValidationError,
} from "../../types/conversations";
```

### 2. Update Repositories Barrel Export

File: `packages/shared/src/repositories/index.ts`
Add if not present:

```typescript
// Conversations
export * from "./conversations";
```

### 3. Update Services Barrel Export

File: `packages/shared/src/services/index.ts`
Add conversations repository exports:

```typescript
// Repositories (for convenience)
export type { ConversationsRepositoryInterface } from "../repositories/conversations";
export { ConversationsRepository } from "../repositories/conversations";
```

### 4. Verify Main Package Export

File: `packages/shared/src/index.ts`
Ensure repositories are exported:

```typescript
// Repositories
export * from "./repositories";
```

### 5. Build and Verify

Run commands to ensure everything compiles:

```bash
# Build shared library
pnpm build:libs

# Type check
pnpm type-check

# Quality check
pnpm quality
```

## Technical Approach

1. Update all barrel exports systematically
2. Use `export type` for interfaces
3. Use regular `export` for classes and errors
4. Group exports logically with comments
5. Build to verify no circular dependencies

## Acceptance Criteria

- ✓ ConversationsRepository exported from shared
- ✓ ConversationsRepositoryInterface exported
- ✓ All conversation types accessible
- ✓ Error classes exported
- ✓ No circular dependencies
- ✓ Build completes successfully
- ✓ Type checking passes
- ✓ Quality checks pass

## Testing Requirements

Create export test:
File: `packages/shared/src/repositories/conversations/__tests__/exports.test.ts`

```typescript
describe("Conversation exports", () => {
  it("should export ConversationsRepository");
  it("should export ConversationsRepositoryInterface");
  it("should export conversation types");
  it("should export error classes");
  it("should be accessible from main package export");
});
```

Verify imports work:

```typescript
// Test import from shared package
import {
  ConversationsRepository,
  ConversationsRepositoryInterface,
  Conversation,
  ConversationNotFoundError,
} from "@fishbowl-ai/shared";
```

## Security Considerations

- Only export public interfaces
- Don't expose internal utilities
- Keep implementation details private
