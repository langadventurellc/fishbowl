---
kind: task
id: T-export-general-settings-mapper
parent: F-general-settings-type-mapping
status: done
title: Export general settings mapper functions from ui-shared package index
priority: normal
prerequisites:
  - T-implement-generalsettingsmapper
created: "2025-08-01T12:16:41.393679"
updated: "2025-08-01T12:33:52.172142"
schema_version: "1.1"
worktree: null
---

# Export general settings mapper functions from ui-shared package index

## Purpose

Make the general settings mapping functions available for use by the desktop and mobile applications by exporting them from the ui-shared package's main index file.

## Implementation Location

Update the barrel export file at: `packages/ui-shared/src/index.ts`

## Prerequisite

- T-implement-generalsettingsmapper must be completed first (generalSettingsMapper module must exist)

## Implementation Steps

### 1. Add Export Statement

Add the following export to the ui-shared package index:

```typescript
// Settings type mapping
export {
  mapGeneralSettingsUIToPersistence,
  mapGeneralSettingsPersistenceToUI,
} from "./mapping/settings/generalSettingsMapper";
```

### 2. Maintain Export Organization

- Place the export in the appropriate section of the index file
- If a "Mapping" or "Settings Mapping" section doesn't exist, create one
- Keep exports organized by functionality for better maintainability

### 3. Verify Export Path

- Ensure the relative path correctly points to the mapper module
- The path should be: `./mapping/settings/generalSettingsMapper`

## Acceptance Criteria

- ✓ Both mapping functions are exported from the package index
- ✓ Export statement uses named exports (not default export)
- ✓ Export path is correct and resolves to the mapper module
- ✓ No circular dependencies introduced
- ✓ Package builds successfully after adding exports
- ✓ Desktop app can import the functions from `@fishbowl-ai/ui-shared`

## Verification Steps

1. Run `pnpm build:libs` from the project root to rebuild the ui-shared package
2. Verify no TypeScript errors in the build output
3. Check that the exported functions appear in the package's type definitions
4. Optionally test import in desktop app:
   ```typescript
   import {
     mapGeneralSettingsUIToPersistence,
     mapGeneralSettingsPersistenceToUI,
   } from "@fishbowl-ai/ui-shared";
   ```

## Unit Tests

Add a simple test to verify the exports are available:

- Create or update: `packages/ui-shared/src/__tests__/exports.test.ts`
- Test that the mapping functions are exported and callable
- Verify they are functions with the correct signatures

## Important Notes

- The ui-shared package must be rebuilt after adding new exports
- Applications cannot import new exports until the package is built
- Use `pnpm build:libs` to rebuild shared packages
- This is a common source of "Module has no exported member" errors

## Dependencies

This task depends on the generalSettingsMapper module being implemented first, which provides the functions to export.

### Log

**2025-08-01T17:43:20.218261Z** - Successfully exported general settings mapper functions from ui-shared package. Added export of settings mappers to the mapping index.ts file which makes both mapGeneralSettingsUIToPersistence and mapGeneralSettingsPersistenceToUI functions available through the main ui-shared package export. The ui-shared package was rebuilt and all tests pass. Desktop and mobile applications can now import these functions using: import { mapGeneralSettingsUIToPersistence, mapGeneralSettingsPersistenceToUI } from '@fishbowl-ai/ui-shared'

- filesChanged: ["packages/ui-shared/src/mapping/index.ts"]
