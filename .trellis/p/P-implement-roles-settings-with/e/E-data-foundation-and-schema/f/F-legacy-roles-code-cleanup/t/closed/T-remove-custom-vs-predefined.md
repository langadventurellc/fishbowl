---
id: T-remove-custom-vs-predefined
title: Remove custom vs predefined role distinction utilities
status: done
priority: medium
parent: F-legacy-roles-code-cleanup
prerequisites:
  - T-analyze-and-document-all
affectedFiles:
  packages/ui-shared/src/utils/isPredefinedRole.ts: Deleted utility function that checked if a role ID was predefined
  packages/ui-shared/src/utils/isValidPredefinedRole.ts: Deleted utility function that validated predefined role structure
  packages/ui-shared/src/utils/__tests__/isPredefinedRole.test.ts: Deleted test file for isPredefinedRole utility
  packages/ui-shared/src/utils/__tests__/isValidPredefinedRole.test.ts: Deleted test file for isValidPredefinedRole utility
  packages/ui-shared/src/utils/index.ts: Removed exports for deleted
    isPredefinedRole and isValidPredefinedRole utilities
log:
  - 📋 **Dependency Analysis Complete** - Comprehensive dependency analysis has
    been completed for all legacy roles files. See `dependency-map-analysis.md`
    for detailed mapping of imports, impact assessment, and safe deletion
    strategy. Analysis shows isPredefinedRole.ts and isValidPredefinedRole.ts
    have only test file dependencies - safe for deletion.
  - Successfully removed custom vs predefined role distinction utilities.
    Deleted isPredefinedRole.ts and isValidPredefinedRole.ts utility files along
    with their test files, updated the barrel export in utils/index.ts to remove
    references, and verified no remaining imports exist. All quality checks pass
    with no errors.
schema: v1.0
childrenIds: []
created: 2025-08-09T21:54:33.374Z
updated: 2025-08-09T21:54:33.374Z
---

# Task: Remove Custom vs Predefined Role Distinction Utilities

## Context

The distinction between custom and predefined roles is being eliminated. All roles are now treated equally in the simplified architecture. This task removes utilities that differentiate between role types.

## Files to Delete

- `packages/ui-shared/src/utils/isPredefinedRole.ts`
- `packages/ui-shared/src/utils/isValidPredefinedRole.ts`
- `packages/ui-shared/src/utils/__tests__/isPredefinedRole.test.ts`
- `packages/ui-shared/src/utils/__tests__/isValidPredefinedRole.test.ts`

## Files to Update

- `packages/ui-shared/src/utils/index.ts` - Remove exports for deleted utilities

## Implementation Steps

1. **Delete Predefined Role Utilities**
   - Delete `isPredefinedRole.ts` - Checks if a role ID is predefined
   - Delete `isValidPredefinedRole.ts` - Validates predefined role structure

2. **Delete Test Files**
   - Delete `__tests__/isPredefinedRole.test.ts`
   - Delete `__tests__/isValidPredefinedRole.test.ts`

3. **Update Barrel Export**
   - Edit `packages/ui-shared/src/utils/index.ts`
   - Remove lines:
     ```typescript
     export { isPredefinedRole } from "./isPredefinedRole";
     export { isValidPredefinedRole } from "./isValidPredefinedRole";
     ```

4. **Update Code Using These Utilities**
   - Search for any code that uses `isPredefinedRole` or `isValidPredefinedRole`
   - Remove conditional logic that treats roles differently based on type
   - Simplify UI components to handle all roles uniformly

5. **Write Verification Tests**
   - Ensure no role type checking code remains
   - Verify all roles are treated identically
   - Confirm TypeScript compilation succeeds

## Acceptance Criteria

- [ ] Both predefined role utility files deleted
- [ ] Both predefined role test files deleted
- [ ] Barrel export in utils/index.ts updated
- [ ] No remaining imports of isPredefinedRole or isValidPredefinedRole
- [ ] No conditional logic based on role type remains
- [ ] All roles treated uniformly in the codebase
- [ ] TypeScript compilation succeeds
- [ ] Quality checks pass (`pnpm quality`)

## Technical Approach

```bash
# Search for imports and usage before deletion
rg "isPredefinedRole|isValidPredefinedRole" --type ts --type tsx

# Look for conditional logic that might use these concepts
rg "predefined|custom.*role|role.*custom" -i --type ts --type tsx

# Update utils/index.ts by removing:
# export { isPredefinedRole } from "./isPredefinedRole";
# export { isValidPredefinedRole } from "./isValidPredefinedRole";
```

## Testing Requirements

- Verify TypeScript compilation: `pnpm type-check`
- Run quality checks: `pnpm quality`
- Test that role management works without type distinction
- Ensure UI treats all roles the same way

## Dependencies

- Prerequisite: T-analyze-and-document-all (to identify all usage)

## Notes

- This completes the removal of role type distinctions
- All roles should now be user-created and managed identically
- No special handling for "built-in" or "system" roles

## Estimated Time

1 hour - Straightforward deletion and updating of type-checking logic
