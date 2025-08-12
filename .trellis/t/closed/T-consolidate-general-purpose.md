---
id: T-consolidate-general-purpose
title: Consolidate general-purpose validation utilities into shared validation folder
status: done
priority: medium
prerequisites: []
affectedFiles:
  packages/shared/src/validation/index.ts: Created barrel exports for all validation utilities
  packages/shared/src/validation/isValidTimestamp.ts: Moved from services/storage/utils/roles/
  packages/shared/src/validation/isJsonSerializable.ts: Moved from services/storage/utils/
  packages/shared/src/validation/safeJsonStringify.ts: Moved from services/storage/utils/
  packages/shared/src/validation/safeJsonParse.ts: Moved from services/storage/utils/
  packages/shared/src/validation/isValidJson.ts: Moved from services/storage/utils/
  packages/shared/src/validation/isValidSchemaVersion.ts: Moved from services/storage/utils/
  packages/shared/src/validation/parseSchemaVersion.ts: Moved from services/storage/utils/
  packages/shared/src/validation/validateWithSchema.ts: Moved from services/storage/utils/
  packages/shared/src/validation/validatePath.ts: Moved from services/storage/utils/
  packages/shared/src/validation/isPathSafe.ts: Moved from services/storage/utils/
  packages/shared/src/validation/sanitizePath.ts: Moved from services/storage/utils/
  packages/shared/src/validation/deepMerge.ts: Moved from services/storage/utils/
  packages/shared/src/validation/sanitizeValue.ts: Moved from types/llmConfig/
  packages/shared/src/validation/groupErrorsByField.ts: Moved from types/llmConfig/
  packages/shared/src/validation/formatZodErrors.ts: Moved from types/llmConfig/
  packages/shared/src/validation/ValidationResult.ts: Consolidated from types/validation/
  packages/shared/src/index.ts: Added validation exports to main barrel
  packages/shared/src/services/storage/utils/index.ts: Removed exports for moved utilities
  packages/shared/src/types/llmConfig/index.ts: Updated imports for moved utilities
  packages/shared/src/services/storage/FileStorageService.ts: Updated import path for safeJsonStringify
  packages/shared/src/repositories/settings/SettingsRepository.ts: Updated import path for deepMerge
log:
  - Successfully consolidated all general-purpose validation utilities into a
    centralized `packages/shared/src/validation/` folder. Moved 15 utility
    functions from scattered locations across the codebase to improve
    discoverability and maintainability. Created comprehensive barrel exports
    and updated all import references throughout the codebase. All quality
    checks pass (lint, format, type-check, and unit tests). The refactoring
    maintains full functionality while organizing code in a more logical
    structure.
schema: v1.0
childrenIds: []
created: 2025-08-10T17:59:56.092Z
updated: 2025-08-10T17:59:56.092Z
---

## Overview

Move all general-purpose validation functions from their current scattered locations to a new centralized validation folder at `packages/shared/src/validation/`. This refactoring will improve discoverability and maintainability by consolidating reusable validation utilities.

## Context

Currently, general-purpose validation functions are scattered across domain-specific folders like `packages/shared/src/services/storage/utils/roles/` and `packages/shared/src/types/llmConfig/`, making them difficult to discover and reuse. This task consolidates all general-purpose validation utilities into a dedicated validation folder.

## Files to Move

### Timestamp/Date Validation

- `packages/shared/src/services/storage/utils/roles/isValidTimestamp.ts` → `packages/shared/src/validation/isValidTimestamp.ts`

### JSON Utilities

- `packages/shared/src/services/storage/utils/isJsonSerializable.ts` → `packages/shared/src/validation/isJsonSerializable.ts`
- `packages/shared/src/services/storage/utils/safeJsonStringify.ts` → `packages/shared/src/validation/safeJsonStringify.ts`
- `packages/shared/src/services/storage/utils/safeJsonParse.ts` → `packages/shared/src/validation/safeJsonParse.ts`
- `packages/shared/src/services/storage/utils/isValidJson.ts` → `packages/shared/src/validation/isValidJson.ts`

### Schema/Version Validation

- `packages/shared/src/services/storage/utils/isValidSchemaVersion.ts` → `packages/shared/src/validation/isValidSchemaVersion.ts`
- `packages/shared/src/services/storage/utils/parseSchemaVersion.ts` → `packages/shared/src/validation/parseSchemaVersion.ts`
- `packages/shared/src/services/storage/utils/validateWithSchema.ts` → `packages/shared/src/validation/validateWithSchema.ts`

### Path/Security Utilities

- `packages/shared/src/services/storage/utils/validatePath.ts` → `packages/shared/src/validation/validatePath.ts`
- `packages/shared/src/services/storage/utils/isPathSafe.ts` → `packages/shared/src/validation/isPathSafe.ts`
- `packages/shared/src/services/storage/utils/sanitizePath.ts` → `packages/shared/src/validation/sanitizePath.ts`

### Object Utilities

- `packages/shared/src/services/storage/utils/deepMerge.ts` → `packages/shared/src/validation/deepMerge.ts`

### Error Handling/Formatting

- `packages/shared/src/types/llmConfig/sanitizeValue.ts` → `packages/shared/src/validation/sanitizeValue.ts`
- `packages/shared/src/types/llmConfig/groupErrorsByField.ts` → `packages/shared/src/validation/groupErrorsByField.ts`
- `packages/shared/src/types/llmConfig/formatZodErrors.ts` → `packages/shared/src/validation/formatZodErrors.ts`

### Validation Types

- `packages/shared/src/types/llmConfig/ValidationResult.ts` → `packages/shared/src/validation/ValidationResult.ts`
- `packages/shared/src/types/validation/ValidationResult.ts` → merge/consolidate with above

## Implementation Steps

1. **Create validation folder structure:**

   ```
   packages/shared/src/validation/
   ├── index.ts (barrel exports)
   ├── isValidTimestamp.ts
   ├── isJsonSerializable.ts
   ├── safeJsonStringify.ts
   ├── safeJsonParse.ts
   ├── isValidJson.ts
   ├── isValidSchemaVersion.ts
   ├── parseSchemaVersion.ts
   ├── validateWithSchema.ts
   ├── validatePath.ts
   ├── isPathSafe.ts
   ├── sanitizePath.ts
   ├── deepMerge.ts
   ├── sanitizeValue.ts
   ├── groupErrorsByField.ts
   ├── formatZodErrors.ts
   └── ValidationResult.ts
   ```

2. **Move files and update imports:**
   - Copy each file to the new validation folder
   - Update any internal imports within the moved files
   - Handle the ValidationResult.ts files (check if they're duplicates or need merging)

3. **Update all import references:**
   - Search entire codebase for imports from the old file locations
   - Update all imports to use new validation folder paths
   - Update any barrel export files (index.ts) that reference these utilities

4. **Remove old files:**
   - Delete original files from old locations after verifying all imports are updated
   - Clean up any now-empty folders

5. **Create barrel exports:**
   - Create `packages/shared/src/validation/index.ts` with proper exports
   - Update `packages/shared/src/index.ts` to export validation utilities if appropriate

6. **Run tests and validate:**
   - Run `pnpm type-check` to ensure no import errors
   - Run `pnpm test` to ensure all functionality still works
   - Run `pnpm lint` to ensure code quality standards

## Technical Approach

- Use search tools to find all current import statements before moving files
- Move files one category at a time to maintain build stability
- Update imports immediately after moving each file to avoid breaking the build
- Pay special attention to internal imports between the validation utilities themselves

## Acceptance Criteria

- [ ] All general-purpose validation functions are moved to `packages/shared/src/validation/`
- [ ] All import statements throughout the codebase are updated to new paths
- [ ] No old files remain in original locations
- [ ] Proper barrel exports created for easy importing
- [ ] All TypeScript compilation passes (`pnpm type-check`)
- [ ] All tests pass (`pnpm test`)
- [ ] All linting passes (`pnpm lint`)
- [ ] ValidationResult.ts files are consolidated without duplication
- [ ] No technical debt left behind (no re-exports or backwards compatibility shims)

## Dependencies

None - this is a standalone refactoring task

## Security Considerations

- Ensure path validation utilities maintain their security properties
- Verify sanitization functions continue to work as expected
- Review that no sensitive validation logic is inadvertently exposed

## Testing Requirements

- All existing unit tests should continue to pass after the move
- Update any test imports that reference the old file locations
- Verify that moved utilities are properly covered by existing tests
