---
id: T-add-chat-store-barrel-exports
title: Add chat store barrel exports and integration
status: done
priority: medium
parent: F-chat-state-management
prerequisites:
  - T-create-core-usechatstore-with
affectedFiles:
  packages/ui-shared/src/stores/chat/useChatStore.ts: Added export keyword to
    ChatStore interface to make it available for barrel export
  packages/ui-shared/src/stores/chat/index.ts: Created chat store barrel export
    file with JSDoc documentation, exporting useChatStore hook and ChatStore
    type interface
  packages/ui-shared/src/stores/index.ts:
    Added chat store exports to main stores
    index using barrel export pattern (export * from './chat')
  packages/ui-shared/src/stores/chat/__tests__/index.test.ts: Created
    comprehensive barrel export test suite covering hook exports, React
    integration, TypeScript types, store functionality, and import resolution
    with 10 passing test cases
log:
  - Successfully implemented chat store barrel exports and integration following
    established patterns. Created the barrel export structure with proper
    TypeScript interface exports, integrated with main stores index, and added
    comprehensive test coverage. All quality checks pass and build process
    succeeds. The chat store is now accessible via clean imports from
    @fishbowl-ai/ui-shared following the same pattern as other stores.
schema: v1.0
childrenIds: []
created: 2025-08-29T22:42:57.349Z
updated: 2025-08-29T22:42:57.349Z
---

# Add Chat Store Barrel Exports and Integration

## Context

Create the barrel export structure for the chat store module and integrate it into the existing store ecosystem. This follows the established patterns from other stores in the shared package.

## Implementation Requirements

### File Locations

- `packages/ui-shared/src/stores/chat/index.ts`
- Update `packages/ui-shared/src/stores/index.ts`

### Chat Store Barrel Export

Create `packages/ui-shared/src/stores/chat/index.ts`:

```typescript
// Chat store barrel exports
export { useChatStore } from "./useChatStore";
export type { ChatStore } from "./useChatStore";
```

### Main Stores Index Integration

Update `packages/ui-shared/src/stores/index.ts` to include chat store:

```typescript
// Existing exports...
export { useAgentsStore } from "./useAgentsStore";

// Add chat store exports
export { useChatStore } from "./chat";
export type { ChatStore } from "./chat";
```

### Package Build Verification

**Ensure shared package builds correctly:**

- Verify TypeScript compilation with new exports
- Check that barrel exports resolve correctly
- Validate no circular dependency issues
- Test import paths from other packages

**Build Command:**
After implementation, run `pnpm build:libs` from project root to rebuild shared packages before testing imports.

### Type Export Patterns

**Follow Established Patterns:**

- Study existing store exports in `packages/ui-shared/src/stores/index.ts`
- Export both the store hook and its TypeScript interface
- Use consistent naming conventions
- Maintain alphabetical ordering where applicable

## Unit Tests Requirements

Create `packages/ui-shared/src/stores/chat/__tests__/index.test.ts`:

**Test Coverage:**

- Test that `useChatStore` exports correctly
- Test that `ChatStore` type exports correctly
- Verify barrel export functionality
- Test import resolution from external packages

**Test Example:**

```typescript
import { useChatStore } from "../index";
import type { ChatStore } from "../index";

describe("Chat store barrel exports", () => {
  it("should export useChatStore", () => {
    expect(useChatStore).toBeDefined();
    expect(typeof useChatStore).toBe("function");
  });

  it("should provide working store instance", () => {
    const state = useChatStore.getState();
    expect(state.sendingMessage).toBe(false);
  });
});
```

## Integration Testing

**Desktop App Import Test:**
Create a simple test to verify the store can be imported from desktop app:

```typescript
// In apps/desktop - test import resolution
import { useChatStore } from "@fishbowl-ai/ui-shared";
```

**Verify Build Process:**

- Run `pnpm build:libs` successfully
- No TypeScript compilation errors
- Desktop app can import without issues

## Detailed Acceptance Criteria

**GIVEN** the useChatStore is implemented
**WHEN** setting up module exports and integration  
**THEN** the implementation should:

- ✅ Export useChatStore hook through barrel exports
- ✅ Export ChatStore TypeScript interface
- ✅ Integrate with main stores index following established patterns
- ✅ Build successfully with `pnpm build:libs`
- ✅ Allow clean imports from desktop app via `@fishbowl-ai/ui-shared`
- ✅ Maintain consistent export patterns with other stores

**Package Integration Requirements:**

- No circular dependencies introduced
- TypeScript compilation succeeds
- Import resolution works from apps/desktop
- Export names follow established conventions

## Out of Scope

- React component integration (separate task)
- IPC event integration (separate task)
- Store initialization logic (handled in core store)
- Performance optimization beyond basic exports

## Dependencies

- **Prerequisite:** T-create-core-usechatstore-with must be completed
- **Build Requirement:** `pnpm build:libs` must run successfully after implementation
- **Pattern Reference:** Existing barrel exports in `packages/ui-shared/src/stores/index.ts`

## References

- Package structure: `packages/ui-shared/src/stores/`
- Build process: Monorepo CLAUDE.md build instructions
- Export patterns: `packages/ui-shared/src/stores/useAgentsStore.ts`
