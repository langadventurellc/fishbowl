# Legacy Roles Code Cleanup - Dependency Analysis

## Overview

This document provides a comprehensive analysis of all import dependencies for the 5 files scheduled for deletion as part of the legacy roles code cleanup. This analysis ensures we can safely remove these files without breaking the application.

## Files to be Deleted

1. `packages/ui-shared/src/stores/rolesPersistence.ts`
2. `packages/ui-shared/src/utils/getRoleCategories.ts`
3. `packages/ui-shared/src/utils/getRolesByCategory.ts`
4. `packages/ui-shared/src/utils/isPredefinedRole.ts`
5. `packages/ui-shared/src/utils/isValidPredefinedRole.ts`

## Dependency Analysis

### 1. rolesPersistence.ts

**Direct Dependencies:**

- `packages/ui-shared/src/stores/index.ts:9` - Barrel export: `export { rolesPersistence } from "./rolesPersistence";`
- `packages/ui-shared/src/stores/rolesStore.ts:14` - Direct import: `import { rolesPersistence } from "./rolesPersistence";`
- `packages/ui-shared/src/stores/__tests__/rolesStore.test.ts:11` - Test import: `import { rolesPersistence } from "../rolesPersistence";`
- `packages/ui-shared/src/stores/__tests__/rolesStore.test.ts:15-16` - Jest mock: `jest.mock("../rolesPersistence", () => ({ rolesPersistence: { ... }})`

**Usage in rolesStore.ts:**

- Line 169: `const loadedRoles = await rolesPersistence.load();` (in loadRoles function)
- Line 181: `await rolesPersistence.save(roles);` (in saveRoles function)

**Impact:** **CRITICAL** - This is actively used by the roles store for persistence operations. These calls will need to be replaced with new persistence logic or removed.

### 2. getRoleCategories.ts

**Direct Dependencies:**

- `packages/ui-shared/src/utils/index.ts:8` - Barrel export: `export { getRoleCategories } from "./getRoleCategories";`
- `packages/ui-shared/src/utils/__tests__/getRoleCategories.test.ts:5` - Test import: `import { getRoleCategories } from "../getRoleCategories";`
- `packages/ui-shared/src/utils/__tests__/getRoleCategories.test.ts:9` - Test usage: `const categories = getRoleCategories();`

**Impact:** **LOW** - Only used in its own test file and exported through barrel. No active usage found in application code.

### 3. getRolesByCategory.ts

**Direct Dependencies:**

- `packages/ui-shared/src/utils/index.ts:9` - Barrel export: `export { getRolesByCategory } from "./getRolesByCategory";`
- `packages/ui-shared/src/utils/__tests__/getRolesByCategory.test.ts:5` - Test import: `import { getRolesByCategory } from "../getRolesByCategory";`
- `packages/ui-shared/src/utils/__tests__/getRolesByCategory.test.ts` - Multiple test usages:
  - Line 9: `const roles = getRolesByCategory();`
  - Line 14: `const creativeRoles = getRolesByCategory("creative");`
  - Line 22: `const roles = getRolesByCategory("non-existent");`
  - Line 27-28: `const roles1 = getRolesByCategory(); const roles2 = getRolesByCategory();`

**Impact:** **LOW** - Only used in its own test file and exported through barrel. No active usage found in application code.

### 4. isPredefinedRole.ts

**Direct Dependencies:**

- `packages/ui-shared/src/utils/index.ts:10` - Barrel export: `export { isPredefinedRole } from "./isPredefinedRole";`
- `packages/ui-shared/src/utils/__tests__/isPredefinedRole.test.ts:5` - Test import: `import { isPredefinedRole } from "../isPredefinedRole";`
- `packages/ui-shared/src/utils/__tests__/isPredefinedRole.test.ts` - Multiple test usages:
  - Line 9: `expect(isPredefinedRole("project-manager")).toBe(true);`
  - Line 10: `expect(isPredefinedRole("technical-advisor")).toBe(true);`
  - Line 14: `expect(isPredefinedRole("custom-role")).toBe(false);`
  - Line 15: `expect(isPredefinedRole("")).toBe(false);`
  - Line 16: `expect(isPredefinedRole("non-existent")).toBe(false);`

**Impact:** **LOW** - Only used in its own test file and exported through barrel. No active usage found in application code.

### 5. isValidPredefinedRole.ts

**Direct Dependencies:**

- `packages/ui-shared/src/utils/index.ts:11` - Barrel export: `export { isValidPredefinedRole } from "./isValidPredefinedRole";`
- `packages/ui-shared/src/utils/__tests__/isValidPredefinedRole.test.ts:5` - Test import: `import { isValidPredefinedRole } from "../isValidPredefinedRole";`
- `packages/ui-shared/src/utils/__tests__/isValidPredefinedRole.test.ts` - Multiple test usages:
  - Line 16: `expect(isValidPredefinedRole(validRole)).toBe(true);`
  - Line 26: `expect(isValidPredefinedRole(validRole)).toBe(true);`
  - Line 30: `expect(isValidPredefinedRole(null)).toBe(false);`
  - Line 31: `expect(isValidPredefinedRole(undefined)).toBe(false);`
  - Line 32: `expect(isValidPredefinedRole({})).toBe(false);`
  - Line 33: `expect(isValidPredefinedRole({ id: "test" })).toBe(false);`
  - Line 34: `expect(isValidPredefinedRole({ id: 123 })).toBe(false);`

**Impact:** **LOW** - Only used in its own test file and exported through barrel. No active usage found in application code.

## Test Files for Deletion

The following test files should also be deleted as they test the utilities being removed:

1. `packages/ui-shared/src/utils/__tests__/getRoleCategories.test.ts`
2. `packages/ui-shared/src/utils/__tests__/getRolesByCategory.test.ts`
3. `packages/ui-shared/src/utils/__tests__/isPredefinedRole.test.ts`
4. `packages/ui-shared/src/utils/__tests__/isValidPredefinedRole.test.ts`

## Barrel Export Impact

The following barrel export files need to be updated to remove the deleted utilities:

### packages/ui-shared/src/utils/index.ts

**Lines to remove:**

- Line 8: `export { getRoleCategories } from "./getRoleCategories";`
- Line 9: `export { getRolesByCategory } from "./getRolesByCategory";`
- Line 10: `export { isPredefinedRole } from "./isPredefinedRole";`
- Line 11: `export { isValidPredefinedRole } from "./isValidPredefinedRole";`

### packages/ui-shared/src/stores/index.ts

**Lines to remove:**

- Line 9: `export { rolesPersistence } from "./rolesPersistence";`

## No External Dependencies Found

✅ **Critical Finding:** No imports found through barrel exports in application code  
✅ **Critical Finding:** No imports found from @fishbowl-ai/ui-shared package for these utilities  
✅ **Critical Finding:** No usage in desktop or mobile applications

The comprehensive search revealed that these utilities are only used:

1. In their own test files
2. Through barrel exports (that are not consumed)
3. `rolesPersistence` is only used in `rolesStore.ts`

## Risk Assessment

### High Risk

- **rolesPersistence.ts**: Used actively in rolesStore.ts for save/load operations

### Low Risk

- **getRoleCategories.ts**: No active usage, only test file
- **getRolesByCategory.ts**: No active usage, only test file
- **isPredefinedRole.ts**: No active usage, only test file
- **isValidPredefinedRole.ts**: No active usage, only test file

## Required Actions for Safe Deletion

### 1. Update rolesStore.ts

- Remove import: `import { rolesPersistence } from "./rolesPersistence";` (line 14)
- Replace or remove `rolesPersistence.load()` call (line 169)
- Replace or remove `rolesPersistence.save(roles)` call (line 181)

### 2. Update Barrel Exports

- Remove exports from `packages/ui-shared/src/utils/index.ts` (lines 8-11)
- Remove export from `packages/ui-shared/src/stores/index.ts` (line 9)

### 3. Delete Test Files

- Delete 4 test files corresponding to the utilities
- Update test suite configuration if needed

### 4. Verify TypeScript Compilation

- Run `pnpm build:libs` after changes
- Ensure no compilation errors

## Conclusion

The analysis shows that **4 out of 5 files can be safely deleted** with minimal impact (only affecting their own test files). The **rolesPersistence.ts file requires careful handling** as it's actively used in the roles store. The lack of external dependencies through barrel exports makes this cleanup operation relatively safe.

**Next Steps:**

1. Update rolesStore.ts to remove rolesPersistence usage
2. Remove barrel exports
3. Delete all 5 files + 4 test files
4. Verify clean TypeScript compilation
