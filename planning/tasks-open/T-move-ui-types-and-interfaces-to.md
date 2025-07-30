---
kind: task
id: T-move-ui-types-and-interfaces-to
title: Move UI types and interfaces to ui-shared package
status: open
priority: high
prerequisites:
  - T-create-ui-shared-package
created: "2025-07-30T16:31:01.080902"
updated: "2025-07-30T16:31:01.080902"
schema_version: "1.1"
---

## Objective

Move all UI-specific types, interfaces, and view models from the shared package to the new ui-shared package.

## Context

The current shared package contains extensive UI types (95+ files) that should be separated from business logic. This includes component props, view models, form data types, and UI-specific enums.

## Implementation Requirements

1. Move all files from `packages/shared/src/types/ui/` to `packages/ui-shared/src/types/`
2. Update internal imports within moved files
3. Create proper barrel exports in ui-shared package
4. Remove UI types from shared package exports

## Technical Approach

1. Copy entire `packages/shared/src/types/ui/` directory to `packages/ui-shared/src/types/`
2. Update any internal imports within the UI types that reference business types:
   - Change imports from relative paths to `@fishbowl-ai/shared`
   - Ensure all business type imports are properly resolved
3. Create comprehensive barrel exports in `packages/ui-shared/src/index.ts`
4. Update `packages/shared/src/types/index.ts` to remove UI type exports
5. Verify all moved types compile correctly

## Files to Move

All files under `packages/shared/src/types/ui/` including:

- `components/` (65+ component prop interfaces)
- `settings/` (25+ settings-related types)
- `core/` (view models for agents, conversations, messages)
- `theme/` (theme-related types)
- `menu/` (context menu types)
- Individual UI type files

## Acceptance Criteria

- [ ] All UI types successfully moved to ui-shared package
- [ ] Internal imports within UI types properly reference business types from @fishbowl-ai/shared
- [ ] ui-shared package exports all moved types correctly
- [ ] shared package no longer exports UI types
- [ ] Both packages compile without errors
- [ ] No broken type references in moved files

## Testing Requirements

- Verify ui-shared package builds successfully
- Confirm all type exports are accessible
- Test that business type imports resolve correctly from ui-shared
- Run type checking on both packages

### Log
