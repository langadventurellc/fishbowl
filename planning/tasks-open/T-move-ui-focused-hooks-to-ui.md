---
kind: task
id: T-move-ui-focused-hooks-to-ui
title: Move UI-focused hooks to ui-shared package
status: open
priority: high
prerequisites:
  - T-move-ui-types-and-interfaces-to
created: "2025-07-30T16:31:13.998282"
updated: "2025-07-30T16:31:13.998282"
schema_version: "1.1"
---

## Objective

Move UI-specific React hooks from the shared package to the ui-shared package while maintaining proper dependencies on business logic.

## Context

Several hooks in the shared package are UI-focused and should be co-located with UI types. These hooks often use business logic but are primarily concerned with UI state and interactions.

## Implementation Requirements

1. Move UI-focused hooks to ui-shared package
2. Update imports to reference types from correct packages
3. Maintain dependencies on business logic from shared package
4. Update exports and imports

## Hooks to Move

From `packages/shared/src/hooks/`:

- `useAgentSearch.ts` - UI search functionality
- `useEnhancedTabNavigation.ts` - UI navigation behavior
- `useCustomRoles.ts` - UI-focused role management hooks

## Technical Approach

1. Create `packages/ui-shared/src/hooks/` directory
2. Move identified hook files to ui-shared package
3. Update imports within hooks:
   - UI types: import from local ui-shared types
   - Business types/stores: import from `@fishbowl-ai/shared`
4. Update `packages/ui-shared/src/index.ts` to export hooks
5. Remove moved hooks from `packages/shared/src/hooks/index.ts`
6. Verify all dependencies resolve correctly

## Acceptance Criteria

- [ ] UI hooks successfully moved to ui-shared package
- [ ] Hooks properly import UI types from local package
- [ ] Hooks properly import business logic from @fishbowl-ai/shared
- [ ] ui-shared package exports all moved hooks
- [ ] shared package no longer exports moved hooks
- [ ] Both packages compile without errors
- [ ] Hook functionality remains intact

## Testing Requirements

- Verify hooks compile and export correctly
- Test that business logic imports resolve properly
- Confirm UI type imports work from local package
- Run unit tests for moved hooks to ensure functionality

### Log
