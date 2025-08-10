---
id: T-clean-up-remaining-test-files
title: Clean up remaining test files and ensure test coverage
status: done
priority: medium
parent: F-legacy-roles-code-cleanup
prerequisites:
  - T-update-all-component-imports
affectedFiles: {}
log:
  - 📋 **Dependency Analysis Complete** - Comprehensive dependency analysis has
    been completed for all legacy roles files. See `dependency-map-analysis.md`
    for detailed mapping of imports, impact assessment, and safe deletion
    strategy. This task benefits from the analysis showing which test files need
    deletion and their exact locations.
  - Successfully completed test file cleanup and validation. All test files were
    already properly updated from previous tasks. Verified no references to
    deleted utilities (getRoleCategories, getRolesByCategory, isPredefinedRole,
    isValidPredefinedRole) exist in test files. All test suites continue to pass
    with proper systemPrompt testing in place. Test fixtures align with new
    RoleViewModel structure without obsolete fields like category or
    isPredefined. Quality checks (linting, formatting, type-checking) all pass
    successfully.
schema: v1.0
childrenIds: []
created: 2025-08-09T21:56:29.357Z
updated: 2025-08-09T21:56:29.357Z
---

# Task: Clean Up Remaining Test Files and Ensure Test Coverage

## Context

After removing legacy utilities and updating components, test files need cleanup. Some tests reference deleted utilities, and we need to ensure adequate test coverage for the simplified role system.

## Test Files to Update/Delete

### Files to Delete (already handled in previous tasks)

- `packages/ui-shared/src/utils/__tests__/getRoleCategories.test.ts`
- `packages/ui-shared/src/utils/__tests__/getRolesByCategory.test.ts`
- `packages/ui-shared/src/utils/__tests__/isPredefinedRole.test.ts`
- `packages/ui-shared/src/utils/__tests__/isValidPredefinedRole.test.ts`

### Files to Update

- `packages/ui-shared/src/stores/__tests__/rolesStore.test.ts`
- Any component test files that reference deleted utilities
- Schema test files if they test obsolete fields

## Implementation Steps

1. **Update rolesStore.test.ts**
   - Remove mock for rolesPersistence (already done in previous task)
   - Remove tests for loadRoles and saveRoles methods
   - Update test data to include systemPrompt field
   - Ensure tests work with new RoleViewModel structure
   - Add tests for systemPrompt handling

2. **Search for Test Files Using Deleted Utilities**

   ```bash
   # Find test files with references to deleted utilities
   rg "getRoleCategories|getRolesByCategory|isPredefinedRole|isValidPredefinedRole" --glob "*.test.ts" --glob "*.test.tsx"
   ```

   - Update or remove these test cases
   - Replace with simplified role testing

3. **Add New Test Coverage**
   - Test that systemPrompt is properly saved and retrieved
   - Test that timestamps are nullable
   - Test simplified role CRUD without categories
   - Test that all roles are treated uniformly

4. **Update Test Data/Fixtures**
   - Remove category fields from test role objects
   - Remove isPredefined flags from test data
   - Add systemPrompt to test role fixtures
   - Ensure test data matches new RoleViewModel

5. **Write Integration Tests**
   - Test complete role lifecycle without persistence
   - Verify role creation with systemPrompt
   - Test that UI components handle simplified roles
   - Ensure no references to deleted concepts

## Acceptance Criteria

- [ ] All test files referencing deleted utilities updated
- [ ] rolesStore tests work without persistence layer
- [ ] Test fixtures updated to new role structure
- [ ] New tests added for systemPrompt field
- [ ] All existing tests pass
- [ ] No test imports of deleted files
- [ ] Test coverage maintained or improved
- [ ] `pnpm test` runs successfully

## Technical Approach

```typescript
// Updated test fixture
const mockRole: RoleViewModel = {
  id: "test-role-1",
  name: "Test Role",
  description: "A test role for unit tests",
  systemPrompt: "You are a helpful assistant", // New field
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  // No category or isPredefined fields
};

// Test example
describe("rolesStore", () => {
  it("should create role with systemPrompt", () => {
    const roleData = {
      name: "New Role",
      description: "Test description",
      systemPrompt: "Test prompt",
    };

    const id = useRolesStore.getState().createRole(roleData);
    const role = useRolesStore.getState().getRoleById(id);

    expect(role?.systemPrompt).toBe("Test prompt");
    // No persistence check needed
  });
});
```

## Testing Requirements

- Run all tests: `pnpm test`
- Verify no failing tests due to missing imports
- Check test coverage if available
- Manually test role management in UI
- Ensure tests are meaningful without persistence

## Dependencies

- Prerequisites: All cleanup and update tasks complete

## Notes

- Focus on maintaining test coverage while simplifying
- Remove complexity from tests - no category or type testing
- Ensure tests reflect the new simplified architecture
- Tests should not mock persistence anymore

## Estimated Time

1.5 hours - Updating multiple test files and ensuring coverage
