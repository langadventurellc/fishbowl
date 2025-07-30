---
kind: task
id: T-move-settings-stores-and-ui
title: Move settings stores and UI state management to ui-shared
status: open
priority: high
prerequisites:
  - T-move-ui-focused-hooks-to-ui
created: "2025-07-30T16:31:27.508212"
updated: "2025-07-30T16:31:27.508212"
schema_version: "1.1"
---

## Objective

Move UI-focused state management (settings modal stores) from shared package to ui-shared package while keeping business logic stores in the shared package.

## Context

The current shared package contains both business logic stores (like customRolesStore for data operations) and UI state stores (like settingsStore for modal state). UI stores should be separated from business stores.

## Implementation Requirements

1. Move settings-related stores to ui-shared package
2. Keep business logic stores in shared package
3. Update store imports and dependencies
4. Maintain proper separation between UI state and business state

## Stores to Move

From `packages/shared/src/stores/`:

- Entire `settings/` directory (12+ files including modal state, navigation, actions)
- `useSettingsModal.ts` (if exists in stores directory)

## Stores to Keep in Shared

- `customRolesStore.ts` - Business logic for role operations
- `customRolesPersistence.ts` - Business data persistence
- Any other business-focused stores

## Technical Approach

1. Create `packages/ui-shared/src/stores/` directory
2. Move `packages/shared/src/stores/settings/` to `packages/ui-shared/src/stores/settings/`
3. Update imports within moved stores:
   - UI types: import from local ui-shared types
   - Business types: import from `@fishbowl-ai/shared`
4. Update `packages/ui-shared/src/index.ts` to export UI stores
5. Update `packages/shared/src/stores/index.ts` to remove moved stores
6. Verify Zustand store functionality remains intact

## Files to Move

- `packages/shared/src/stores/settings/` (entire directory)
- Any other UI-focused store files

## Acceptance Criteria

- [ ] Settings stores successfully moved to ui-shared package
- [ ] Business logic stores remain in shared package
- [ ] Moved stores properly import from correct packages
- [ ] ui-shared package exports all moved stores
- [ ] shared package only exports business stores
- [ ] Zustand stores function correctly in new location
- [ ] Store state management remains intact

## Testing Requirements

- Test settings store functionality after move
- Verify business stores remain functional in shared package
- Run store unit tests to confirm state management works
- Test store imports resolve correctly from both packages

### Log
