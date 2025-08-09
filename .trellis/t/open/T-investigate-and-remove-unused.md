---
id: T-investigate-and-remove-unused
title: Investigate and remove unused files safely
status: open
priority: medium
prerequisites: []
affectedFiles: {}
log: []
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
