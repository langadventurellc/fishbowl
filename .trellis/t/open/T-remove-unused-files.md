---
id: T-remove-unused-files
title: Remove unused files identified by Knip analysis
status: open
priority: medium
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-21T18:07:44.005Z
updated: 2025-08-21T18:07:44.005Z
---

# Remove Unused Files - Knip Cleanup

## Context

Following a thorough Knip analysis and validation, 19 files have been identified as genuinely unused in the codebase and can be safely removed without affecting functionality.

## Implementation Requirements

### Files to Delete (19 total)

**Desktop Components (5 files):**

- `apps/desktop/src/components/settings/agents/AgentNameInput.tsx`
- `apps/desktop/src/components/settings/FormActions.tsx`
- `apps/desktop/src/components/settings/FormHeader.tsx`
- `apps/desktop/src/components/settings/personalities/SavedPersonalitiesTab.tsx`
- `apps/desktop/src/components/settings/TabContainer.tsx`

**Utility Files (4 files):**

- `apps/desktop/src/utils/sliderDescriptions.ts`
- `apps/desktop/src/utils/sliderKeyboardHandler.ts`
- `apps/desktop/src/main/services/index.ts` (empty barrel file)
- `apps/desktop/src/main/utils/index.ts` (empty barrel file)
- `apps/desktop/src/renderer/utils/index.ts` (empty barrel file)

**Shared Package Files (3 files):**

- `packages/shared/src/services/storage/RolesFileRecoveryService.ts`
- `packages/shared/src/services/storage/utils/roles/recoverPartialRolesData.ts`
- `packages/shared/src/types/agents/index.ts`

**Test Helper Files (7 files):**

- `tests/desktop/helpers/settings/createDuplicateNameAgentData.ts`
- `tests/desktop/helpers/settings/createInvalidAgentData.ts`
- `tests/desktop/helpers/settings/createLongTextAgentData.ts`
- `tests/desktop/helpers/settings/createMinimalAgentData.ts`
- `tests/desktop/helpers/settings/createSpecialCharAgentData.ts`
- `tests/desktop/helpers/settings/MockAgentData.ts`

## Technical Approach

1. **Verify current status**: Double-check that these files are still unused (in case of recent changes)
2. **Safe deletion**: Remove files one group at a time to catch any unexpected dependencies
3. **Test after each group**: Run quality checks after deleting each category of files
4. **Clean up empty directories**: Remove any empty directories left behind

## Acceptance Criteria

- [ ] All 19 identified unused files are successfully deleted
- [ ] No build errors or test failures after deletion
- [ ] Empty directories are cleaned up where appropriate
- [ ] `pnpm quality` passes after all deletions
- [ ] Codebase still functions normally (no broken imports or references)

## Verification Steps

1. Run `pnpm quality` before and after to ensure no regressions
2. Verify no unexpected references were missed by running a quick grep search for any file names
3. Check that the remaining codebase builds and tests pass

## Security Considerations

- Ensure no secrets or important configuration were stored in these files
- Verify no critical business logic was accidentally marked as unused
