---
kind: task
id: T-move-ui-focused
title: Move UI-focused ValidationResultViewModel to types/ui directory
status: open
priority: normal
prerequisites: []
created: "2025-07-30T01:45:24.591018"
updated: "2025-07-30T01:45:24.591018"
schema_version: "1.1"
---

# Move UI-focused ValidationResultViewModel to types/ui directory

## Context and Purpose

The `ValidationResultViewModel` type is currently located in `packages/shared/src/types/validation/` but is UI-focused and should be moved to the `packages/shared/src/types/ui/` directory to align with the architectural goal of consolidating all UI types in the ui directory.

## Implementation Steps

### 1. Move the ValidationResultViewModel file

- **Source**: `packages/shared/src/types/validation/ValidationResultViewModel.ts`
- **Destination**: `packages/shared/src/types/ui/ValidationResultViewModel.ts`
- **Action**: Move the file and ensure the interface definition remains unchanged

### 2. Update export barrel files

- **Update** `packages/shared/src/types/ui/index.ts` to export ValidationResultViewModel:

  ```typescript
  // Add this line
  export * from "./ValidationResultViewModel";
  ```

- **Update** `packages/shared/src/types/validation/index.ts` to remove ValidationResultViewModel export if it exists

### 3. Find and update all import statements

- **Search pattern**: Look for imports of ValidationResultViewModel from validation directory
- **Update from**: `import { ValidationResultViewModel } from "@fishbowl-ai/shared"`
- **Update to**: Same import (should still work since it's re-exported from main index)
- **Verify**: All imports resolve correctly after the move

### 4. Build and test validation

- Run `pnpm build:libs` to rebuild shared package
- Run `pnpm quality` to check for any type errors
- Run `pnpm test` to ensure no functionality is broken

## Acceptance Criteria

### Functional Requirements

- ✅ ValidationResultViewModel file moved to `packages/shared/src/types/ui/`
- ✅ All existing imports continue to work without modification
- ✅ File content and interface definition unchanged
- ✅ No TypeScript compilation errors after move

### Technical Requirements

- ✅ Build passes (`pnpm build:libs`)
- ✅ Quality checks pass (`pnpm quality`)
- ✅ All tests pass (`pnpm test`)
- ✅ Import paths resolve correctly

### Documentation Requirements

- ✅ Export barrel files updated correctly
- ✅ File location reflects UI-focused purpose

## Time Estimate

**Total: 45 minutes**

- File move and export updates: 15 minutes
- Import verification: 15 minutes
- Build and test validation: 15 minutes

### Log
