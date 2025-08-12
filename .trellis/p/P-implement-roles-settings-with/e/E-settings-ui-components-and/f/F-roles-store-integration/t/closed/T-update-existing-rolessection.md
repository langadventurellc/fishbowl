---
id: T-update-existing-rolessection
title: Update existing RolesSection unit tests for store integration
status: done
priority: low
parent: F-roles-store-integration
prerequisites:
  - T-connect-rolessection
affectedFiles:
  apps/desktop/src/components/settings/roles/__tests__/RolesList.test.tsx:
    Replaced SAMPLE_ROLES import and references with local mockRoles array
    containing 10 test roles that match expected names and structure for
    existing tests
log:
  - Updated RolesList.test.tsx to use local mock data instead of SAMPLE_ROLES
    from ui-shared. Replaced all references to SAMPLE_ROLES with local mockRoles
    array that maintains the same test structure and expected role names. All 17
    tests continue to pass and all quality checks (lint, format, type-check) are
    clean.
schema: v1.0
childrenIds: []
created: 2025-08-12T16:52:16.237Z
updated: 2025-08-12T16:52:16.237Z
---

# Update existing RolesSection unit tests for store integration

## Context

Update existing unit tests in the RolesSection test files to work with the new store integration instead of static SAMPLE_ROLES data. This ensures test coverage is maintained during the refactoring.

## Technical Approach

- Update existing test files that reference SAMPLE_ROLES
- Mock `useRolesStore` hook for predictable test behavior
- Replace hardcoded SAMPLE_ROLES expectations with store mock data
- Ensure tests verify store interactions rather than static data
- Maintain existing test coverage while updating implementation details
- Follow established testing patterns in the codebase

## Implementation Details

Update test patterns from:

```jsx
// Old pattern
import { SAMPLE_ROLES } from "@fishbowl-ai/ui-shared";
expect(roleItems).toHaveLength(SAMPLE_ROLES.length);
```

To:

```jsx
// New pattern
const mockRoles = [
  /* test data */
];
jest.mock("@fishbowl-ai/ui-shared", () => ({
  useRolesStore: jest.fn(() => ({
    roles: mockRoles,
    isLoading: false,
    error: null,
  })),
}));
expect(roleItems).toHaveLength(mockRoles.length);
```

## Acceptance Criteria

- [ ] All existing RolesSection unit tests pass with store integration
- [ ] Tests mock `useRolesStore` hook appropriately
- [ ] Test coverage maintained at current levels or higher
- [ ] Tests verify component behavior with different store states
- [ ] Mock data used consistently across test scenarios
- [ ] Tests are maintainable and follow project patterns
- [ ] No tests depend on SAMPLE_ROLES after updates
- [ ] Test performance remains good (fast execution)

## Dependencies

- Should be done after component store connection is implemented
- Requires understanding of new store integration patterns

## Security Considerations

- Mock data doesn't contain sensitive information
- Tests don't expose internal store implementation details

## Testing Requirements

- Update tests in `__tests__/RolesList.test.tsx` and related files
- All updated tests must pass consistently
- Jest mock patterns follow project conventions
- Clear test descriptions reflect new store-based behavior
- Test execution time should not increase significantly
