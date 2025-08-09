---
id: T-clean-up-unused-predefined
title: Clean up unused predefined components and imports
status: done
priority: medium
parent: F-unify-roles-ui-remove
prerequisites:
  - T-refactor-rolessection
affectedFiles:
  apps/desktop/src/components/settings/roles/PredefinedRolesTab.tsx: deleted - unused component after unified roles UI
  apps/desktop/src/components/settings/roles/PredefinedRoleCard.tsx: deleted - unused component after unified roles UI
  packages/ui-shared/src/types/settings/PredefinedRoleCardProps.ts: deleted - unused type definition
  packages/ui-shared/src/types/settings/PredefinedRolesTabProps.ts: deleted - unused type definition
  packages/ui-shared/src/types/settings/index.ts: removed exports for deleted type definitions
log:
  - Successfully cleaned up unused predefined role components and types after
    RolesSection refactoring. Deleted PredefinedRolesTab and PredefinedRoleCard
    components along with their associated type definitions. Updated shared
    package barrel exports to remove deleted types. All quality checks pass and
    roles section displays correctly with unified SAMPLE_ROLES data. Preserved
    data infrastructure (predefinedRoles.ts, utilities) for future
    functionality.
schema: v1.0
childrenIds: []
created: 2025-08-09T03:59:08.532Z
updated: 2025-08-09T03:59:08.532Z
---

# Clean Up Unused Predefined Components and Imports

## Context

After refactoring RolesSection to use a unified list view, several predefined-role-specific components and imports are no longer needed. This task removes unused code while preserving anything that might be needed for future functionality.

## Reference Files

- `/apps/desktop/src/components/settings/roles/` - Directory with role components
- `/apps/desktop/src/components/settings/roles/index.ts` - Barrel export file
- `/packages/ui-shared/src/types/settings/index.ts` - Shared types barrel export

## Files to Remove or Modify

### 1. Remove PredefinedRolesTab Component

**Files to delete**:

- `/apps/desktop/src/components/settings/roles/PredefinedRolesTab.tsx`
- `/apps/desktop/src/components/settings/roles/PredefinedRoleCard.tsx`
- Test files if they exist:
  - `/apps/desktop/src/components/settings/roles/__tests__/PredefinedRolesTab.test.tsx`
  - `/apps/desktop/src/components/settings/roles/__tests__/PredefinedRoleCard.test.tsx`

### 2. Update Barrel Export Files

**File**: `/apps/desktop/src/components/settings/roles/index.ts`

**Remove exports**:

```typescript
// Remove these lines:
export { PredefinedRolesTab } from "./PredefinedRolesTab";
export { PredefinedRoleCard } from "./PredefinedRoleCard";
```

**Keep exports**:

- RolesSection (modified)
- CustomRolesTab (still used as reference)
- All modal components
- Form components
- Other utility components

### 3. Update Type Imports in Shared Package

**File**: `/packages/ui-shared/src/types/settings/index.ts`

**Review and potentially remove**:

- `PredefinedRolesTabProps` (if it exists and is unused)
- `PredefinedRoleCardProps` (if it exists and is unused)

**Keep**:

- `PredefinedRole` interface (may be needed for future data transformation)
- All other role-related types
- CustomRoleViewModel interface

### 4. Check for Other Import References

**Search and update files that import removed components**:

Locations to check:

- Other components in roles directory
- Parent settings components
- Test files
- Story files (if using Storybook)

**Remove imports like**:

```typescript
import { PredefinedRolesTab } from "./PredefinedRolesTab";
import { PredefinedRoleCard } from "./PredefinedRoleCard";
```

### 5. Preserve Predefined Data Infrastructure

**Keep these files** (needed for sample data and future functionality):

- `/packages/ui-shared/src/data/predefinedRoles.ts`
- `/packages/ui-shared/src/types/settings/PredefinedRole.ts`
- Utility functions like `getRolesByCategory.ts`, `isPredefinedRole.ts`

## Implementation Steps

### Step 1: Identify All References

```bash
# From project root, search for imports of removed components
grep -r "PredefinedRolesTab" --include="*.ts" --include="*.tsx" apps/
grep -r "PredefinedRoleCard" --include="*.ts" --include="*.tsx" apps/
```

### Step 2: Remove Component Files

- Delete the actual component files
- Remove corresponding test files

### Step 3: Update Import Statements

- Remove imports in any files that referenced the deleted components
- Update barrel exports to exclude deleted components

### Step 4: Verify No Broken Imports

- Run TypeScript compilation to check for broken imports
- Fix any remaining import issues

## Acceptance Criteria

- [ ] PredefinedRolesTab.tsx component file deleted
- [ ] PredefinedRoleCard.tsx component file deleted
- [ ] Related test files removed
- [ ] Barrel export index.ts files updated to exclude removed components
- [ ] No broken import statements remain
- [ ] TypeScript compilation passes without errors
- [ ] No runtime errors when loading roles section
- [ ] Predefined data infrastructure preserved (predefinedRoles.ts, etc.)
- [ ] Sample data still imports and works correctly

## Testing Requirements

- **Compilation Test**: Verify `pnpm type-check` passes
- **Runtime Test**: Load roles section in app to ensure no import errors
- **Import Verification**: Check that removed components cannot be imported
- **Sample Data Test**: Verify SAMPLE_ROLES still works correctly

## Dependencies

- **Prerequisites**: T-refactor-rolessection (ensures components are no longer referenced)

## Security Considerations

- Removing unused code reduces attack surface
- No security-sensitive code being removed
- Predefined data infrastructure preserved for future secure implementation

## Implementation Notes

- Be conservative - if unsure whether something is needed, keep it
- Document any borderline decisions in code comments
- Consider creating a migration guide for future developers
- Use IDE "Find All References" to ensure complete cleanup
- Test thoroughly after each deletion to catch issues early

## Post-Task Verification

After completing this task, run:

```bash
pnpm type-check  # Verify TypeScript compilation
pnpm lint       # Check for any linting issues
pnpm quality    # Run full quality checks
```
