---
id: T-migrate-roles-components-to
title: Migrate roles components to use useServices() hook
status: done
priority: medium
parent: F-logger-dependency-injection
prerequisites:
  - T-update-userolesstore-for
affectedFiles:
  apps/desktop/src/components/settings/roles/CreateRoleForm.tsx:
    Migrated from createLoggerSync to useServices() hook, moved logger access
    inside component function, added logger to useCallback dependency array
  apps/desktop/src/components/settings/roles/RolesSection.tsx:
    Migrated from createLoggerSync to useServices() hook, moved logger access
    inside component function, added logger to all useCallback dependency arrays
  apps/desktop/src/components/settings/roles/__tests__/CreateRoleForm.basic.test.tsx: Updated test mocks to mock useServices hook instead of createLoggerSync
  apps/desktop/src/components/settings/roles/__tests__/CreateRoleForm.edit.test.tsx: Updated test mocks to mock useServices hook instead of createLoggerSync
  apps/desktop/src/components/settings/roles/__tests__/CreateRoleForm.changeDetection.test.tsx: Updated test mocks to mock useServices hook instead of createLoggerSync
  apps/desktop/src/components/settings/roles/__tests__/RolesSection.error.test.tsx: Updated test mocks to mock useServices hook instead of createLoggerSync
log:
  - Successfully migrated both roles components from createLoggerSync to
    useServices() hook pattern. Replaced module-level logger creation with
    component-level hook usage, updated all useCallback dependency arrays, and
    fixed all test mocks. All 91 roles tests pass and quality checks are clean.
schema: v1.0
childrenIds: []
created: 2025-08-18T15:28:05.069Z
updated: 2025-08-18T15:28:05.069Z
---

# Migrate Roles Components to use useServices() Hook

## Context

Part of the logger dependency injection refactor. These roles-related components currently create their own loggers using `createLoggerSync` instead of using the properly configured logger from RendererProcessServices via the `useServices()` hook.

## Files to Modify

- `apps/desktop/src/components/settings/roles/CreateRoleForm.tsx`
- `apps/desktop/src/components/settings/roles/RolesSection.tsx`

## Technical Approach

### Current Pattern (to remove):

```typescript
import { createLoggerSync } from "@fishbowl-ai/shared";

const logger = createLoggerSync({
  config: { name: "ComponentName", level: "info" },
});
```

### Target Pattern:

```typescript
import { useServices } from "../../../contexts"; // adjust path as needed

function Component() {
  const { logger } = useServices();
  // ... rest of component logic
}
```

## Specific Implementation Requirements

### 1. Update Imports

- Remove: `import { createLoggerSync } from "@fishbowl-ai/shared"`
- Add: `import { useServices } from "../../../contexts"` (adjust path for each component)
- Maintain all other existing imports

### 2. Replace Logger Creation with Hook Usage

- Remove module-level logger creation: `const logger = createLoggerSync(...)`
- Add `useServices()` hook usage inside component function
- Extract logger from services: `const { logger } = useServices()`

### 3. Update Component Structure

- Move logger access inside React component function (not module-level)
- Ensure logger is accessible to all component methods that need it
- Pass logger to child components or utility functions as needed

### 4. Maintain Existing Functionality

- Preserve all existing roles management behavior
- Keep same logging calls and log levels
- Maintain error handling patterns
- Preserve form validation and submission logic

## Implementation Details per Component

### CreateRoleForm.tsx

- Currently at line 40-42: Remove module-level logger
- Add `useServices()` hook inside CreateRoleForm component
- Update logging calls in form submission, validation, and error handling
- Ensure logger is accessible in form event handlers

### RolesSection.tsx

- Currently at line 30-32: Remove module-level logger
- Add `useServices()` hook inside RolesSection component
- Update logging calls in roles management operations (create, update, delete)
- Ensure logger is accessible in modal handling and list operations

## Detailed Acceptance Criteria

### Functional Requirements

- [ ] Both roles components use `useServices()` hook for logger access
- [ ] No `createLoggerSync` imports in either component
- [ ] No module-level logger creation in either component
- [ ] All existing roles functionality works unchanged
- [ ] Form submission and validation logging preserved
- [ ] Roles CRUD operations logging preserved

### Technical Requirements

- [ ] Import `useServices` with correct relative paths
- [ ] Logger accessed via `const { logger } = useServices()` pattern
- [ ] Logger used within React component function scope only
- [ ] All TypeScript types and interfaces maintained
- [ ] No ESLint or TypeScript compilation errors

### Integration Requirements

- [ ] Components integrate properly with ServicesProvider context
- [ ] Components work with updated useRolesStore (dependency injection pattern)
- [ ] Error handling when services context not available
- [ ] Components work correctly within settings modal

## Unit Testing Requirements

- [ ] Update component tests to mock `useServices()` hook
- [ ] Remove `createLoggerSync` mocks from component tests
- [ ] Test logging functionality still works with mocked services
- [ ] Ensure existing form validation tests still pass
- [ ] Ensure existing roles management tests still pass
- [ ] Add test for error case when services context missing

## Dependencies

- Requires T-update-userolesstore-for to be completed (for roles store initialization)
- Components must be used within ServicesProvider context

## Success Metrics

1. **Code Consistency**: Components use single logger configuration source
2. **Maintainability**: Simplified logger usage patterns
3. **Testability**: Easier mocking with centralized services
4. **Functionality**: All existing roles features work exactly as before
