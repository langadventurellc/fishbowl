---
id: T-investigate-and-remove-unused
title: Investigate and remove unused files safely
status: done
priority: medium
prerequisites: []
affectedFiles:
  apps/desktop/src/components/ui/context-menu.tsx: removed unused shadcn/ui context menu component
  apps/desktop/src/hooks/useRoleFormModal.ts: removed unused role form modal hook
  apps/desktop/src/hooks/useRoleDeleteDialog.ts: removed unused role delete dialog hook
  apps/desktop/src/hooks/types/UseRoleFormModalReturn.ts: removed unused role form modal return type
  apps/desktop/src/hooks/useIsCompactViewport.ts: removed unused compact viewport hook
  apps/desktop/src/hooks/useIsMobile.ts: removed deprecated mobile detection hook
  apps/desktop/src/utils/focusManagement.ts: removed unused focus management utilities
  apps/desktop/src/utils/skipLinks.ts: removed unused skip links utilities
  packages/ui-shared/src/mapping/utils/examples.ts: removed unused mapping utility examples
  apps/desktop/src/hooks/index.ts: updated to remove references to deleted hooks
log:
  - >-
    Successfully investigated 18 files identified by knip and removed 9
    genuinely unused files. Analysis revealed knip had false positives for
    barrel files (index.ts) and some components that are used but not directly
    imported by their barrel exports.


    Removed files:

    - shadcn/ui context-menu.tsx (unused, app uses custom ContextMenu)

    - Role management hooks: useRoleFormModal.ts, useRoleDeleteDialog.ts,
    UseRoleFormModalReturn.ts (unused role features)

    - Viewport hooks: useIsCompactViewport.ts, useIsMobile.ts
    (unused/deprecated)

    - Accessibility utilities: focusManagement.ts, skipLinks.ts (unused)

    - Example code: mapping/utils/examples.ts (never called)


    Updated hooks/index.ts to remove references to deleted files. All quality
    checks and tests pass after cleanup.
schema: v1.0
childrenIds: []
created: 2025-08-09T17:03:38.623Z
updated: 2025-08-09T17:03:38.623Z
---

# Investigate and Remove Unused Files Safely

## Context

Knip analysis identified 18 unused files across the codebase. These need careful investigation before removal to ensure they're not:

- Dynamically imported
- Used by tests
- Part of incomplete features
- Required by build system

## Specific Implementation Requirements

Investigate and potentially remove these unused files:

**High Priority for Removal:**

- `apps/desktop/src/adapters/index.ts` - Empty barrel file
- `apps/desktop/src/hooks/index.ts` - Empty barrel file
- `packages/ui-shared/src/mapping/utils/examples.ts` - Example code
- `apps/mobile/src/providers/index.ts` - Empty barrel file

**Medium Priority (Investigate first):**

- `apps/desktop/src/components/settings/FormErrorDisplay.tsx`
- `apps/desktop/src/components/ui/context-menu.tsx`
- `apps/desktop/src/hooks/types/NavigationItem.ts`
- `apps/desktop/src/hooks/types/UseRoleFormModalReturn.ts`
- `apps/desktop/src/utils/focusManagement.ts`
- `apps/desktop/src/utils/skipLinks.ts`

**Low Priority (Feature-related, investigate thoroughly):**

- `apps/desktop/src/hooks/useIsCompactViewport.ts`
- `apps/desktop/src/hooks/useIsMobile.ts`
- `apps/desktop/src/hooks/useRoleDeleteDialog.ts`
- `apps/desktop/src/hooks/useRoleFormModal.ts`
- `apps/mobile/src/providers/AIServiceProvider.tsx`
- `apps/mobile/src/providers/AppProviders.tsx`
- `apps/mobile/src/providers/DatabaseProvider.tsx`
- `apps/mobile/src/providers/StorageProvider.tsx`

## Technical Approach

1. For each file, search the codebase for any references (imports, dynamic imports, etc.)
2. Check if files are used in tests, even if not in main code
3. Examine git history to understand if files are part of incomplete features
4. Create a removal plan starting with safest files (empty barrel files, examples)
5. Remove files in batches, testing between each batch
6. Update any import statements that referenced removed files

## Detailed Acceptance Criteria

- All truly unused files identified and categorized by risk level
- Safe files (empty barrels, examples) removed without issues
- Remaining files investigated with documentation of findings
- No broken imports or build errors after file removal
- Test suite continues to pass after cleanup
- Git commit history preserved for removed files (for potential recovery)

## Security Considerations

- Verify removed files don't contain security utilities still in use
- Ensure no security-related configuration is lost

## Testing Requirements

- Run full test suite after each batch of file removals: `pnpm test`
- Verify builds work: `pnpm build:libs` and `pnpm type-check`
- Test key application functionality manually
- Check for any runtime errors in development mode

## Dependencies

None - this task can be completed independently.
