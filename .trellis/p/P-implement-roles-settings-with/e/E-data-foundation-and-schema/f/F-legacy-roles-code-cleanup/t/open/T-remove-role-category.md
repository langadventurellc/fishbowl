---
id: T-remove-role-category
title: Remove role category utilities and related tests
status: open
priority: medium
parent: F-legacy-roles-code-cleanup
prerequisites:
  - T-analyze-and-document-all
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-09T21:54:02.242Z
updated: 2025-08-09T21:54:02.242Z
---

# Task: Remove Role Category Utilities and Related Tests

## Context

Role categories are no longer part of the simplified roles architecture. All category-related utilities and their tests need to be removed, along with updating any files that import them.

## Files to Delete

- `packages/ui-shared/src/utils/getRoleCategories.ts`
- `packages/ui-shared/src/utils/getRolesByCategory.ts`
- `packages/ui-shared/src/utils/__tests__/getRoleCategories.test.ts`
- `packages/ui-shared/src/utils/__tests__/getRolesByCategory.test.ts`

## Files to Update

- `packages/ui-shared/src/utils/index.ts` - Remove exports for deleted utilities

## Implementation Steps

1. **Delete Category Utility Files**
   - Delete `getRoleCategories.ts` - Returns list of role categories
   - Delete `getRolesByCategory.ts` - Filters roles by category

2. **Delete Test Files**
   - Delete `__tests__/getRoleCategories.test.ts`
   - Delete `__tests__/getRolesByCategory.test.ts`

3. **Update Barrel Export**
   - Edit `packages/ui-shared/src/utils/index.ts`
   - Remove lines:
     ```typescript
     export { getRoleCategories } from "./getRoleCategories";
     export { getRolesByCategory } from "./getRolesByCategory";
     ```

4. **Search and Update Imports**
   - Search for any remaining imports of these utilities
   - Remove or comment out code that uses category filtering
   - Update UI components that display categories (remove category display logic)

5. **Write Verification Tests**
   - Ensure no imports of deleted utilities remain
   - Verify TypeScript compilation succeeds
   - Check that utils barrel export is clean

## Acceptance Criteria

- [ ] Both category utility files deleted
- [ ] Both category test files deleted
- [ ] Barrel export in utils/index.ts updated
- [ ] No remaining imports of getRoleCategories or getRolesByCategory
- [ ] TypeScript compilation succeeds
- [ ] No UI components attempting to display role categories
- [ ] Quality checks pass (`pnpm quality`)

## Technical Approach

```bash
# Search for imports before deletion
rg "getRoleCategories|getRolesByCategory" --type ts --type tsx

# After deletion, verify no references remain
rg "getRoleCategories|getRolesByCategory" --type ts --type tsx

# Update utils/index.ts by removing these lines:
# export { getRoleCategories } from "./getRoleCategories";
# export { getRolesByCategory } from "./getRolesByCategory";
```

## Testing Requirements

- Verify TypeScript compilation: `pnpm type-check`
- Run quality checks: `pnpm quality`
- Ensure no runtime errors from missing category utilities
- Test that remaining utilities in the utils folder still work

## Dependencies

- Prerequisite: T-analyze-and-document-all (to identify all imports)

## Notes

- Category-based role organization is being completely removed
- All roles will be treated uniformly without categorization
- UI should no longer show category filters or groupings

## Estimated Time

1 hour - Straightforward deletion of utilities and updating imports
