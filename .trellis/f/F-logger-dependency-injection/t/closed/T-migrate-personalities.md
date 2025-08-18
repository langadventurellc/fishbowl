---
id: T-migrate-personalities
title: Migrate personalities components to use useServices() hook
status: done
priority: medium
parent: F-logger-dependency-injection
prerequisites:
  - T-update-usepersonalitiesstore
affectedFiles:
  apps/desktop/src/components/settings/personalities/PersonalityForm.tsx:
    Migrated from module-level createLoggerSync to useServices() hook pattern.
    Removed createLoggerSync import, added useServices import, moved logger
    access inside component function, and added logger to handleSave dependency
    array.
  apps/desktop/src/components/settings/personalities/PersonalitiesSection.tsx:
    Migrated from module-level createLoggerSync to useServices() hook pattern.
    Removed createLoggerSync import, added useServices import, moved logger
    access inside component function, and added logger to dependency arrays for
    handleCreatePersonality, handleEditPersonality, handleDeletePersonality,
    handleFormSave, and handleConfirmDelete callbacks.
  apps/desktop/src/components/settings/personalities/__tests__/PersonalitiesSection.test.tsx:
    Updated test mocks to use useServices hook pattern instead of
    createLoggerSync. Changed mock path to ../../../../contexts and replaced
    createLoggerSync mock with useServices mock returning a logger object.
log:
  - >-
    Successfully migrated both PersonalityForm and PersonalitiesSection
    components to use useServices() hook for logger dependency injection.


    ✅ **Key Changes Made:**

    - Removed `createLoggerSync` imports from both components

    - Added `useServices` imports with correct relative paths

    - Replaced module-level logger creation with hook-based access inside
    component functions

    - Added logger to all React Hook dependency arrays to satisfy ESLint rules

    - Fixed test file to use `useServices` mock instead of `createLoggerSync`
    mock


    ✅ **Technical Implementation:**

    - PersonalityForm.tsx: Migrated logger access and fixed dependency array in
    handleSave callback

    - PersonalitiesSection.tsx: Migrated logger access and fixed dependency
    arrays in 5 useCallback hooks

    - PersonalitiesSection.test.tsx: Updated test mocks to use useServices
    pattern

    - All existing logging functionality preserved with identical behavior

    - Components now properly consume logger from ServicesProvider context


    ✅ **Quality Assurance:**

    - All ESLint warnings resolved for modified components

    - TypeScript compilation successful  

    - All unit tests passing (including updated PersonalitiesSection test)

    - Prettier formatting applied

    - All existing personalities features work exactly as before

    - Logger configuration now centralized through dependency injection pattern
schema: v1.0
childrenIds: []
created: 2025-08-18T15:28:17.421Z
updated: 2025-08-18T15:28:17.421Z
---

# Migrate Personalities Components to use useServices() Hook

## Context

Part of the logger dependency injection refactor. These personalities-related components currently create their own loggers using `createLoggerSync` instead of using the properly configured logger from RendererProcessServices via the `useServices()` hook.

## Files to Modify

- `apps/desktop/src/components/settings/personalities/PersonalityForm.tsx`
- `apps/desktop/src/components/settings/personalities/PersonalitiesSection.tsx`

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

- Preserve all existing personalities management behavior
- Keep same logging calls and log levels
- Maintain error handling patterns
- Preserve form validation and submission logic

## Implementation Details per Component

### PersonalityForm.tsx

- Currently at line 43-45: Remove module-level logger
- Add `useServices()` hook inside PersonalityForm component
- Update logging calls in form submission, validation, and error handling
- Ensure logger is accessible in form event handlers and async operations

### PersonalitiesSection.tsx

- Currently at line 30-32: Remove module-level logger
- Add `useServices()` hook inside PersonalitiesSection component
- Update logging calls in personalities management operations (create, update, delete)
- Ensure logger is accessible in modal handling and list operations

## Detailed Acceptance Criteria

### Functional Requirements

- [ ] Both personalities components use `useServices()` hook for logger access
- [ ] No `createLoggerSync` imports in either component
- [ ] No module-level logger creation in either component
- [ ] All existing personalities functionality works unchanged
- [ ] Form submission and validation logging preserved
- [ ] Personalities CRUD operations logging preserved

### Technical Requirements

- [ ] Import `useServices` with correct relative paths
- [ ] Logger accessed via `const { logger } = useServices()` pattern
- [ ] Logger used within React component function scope only
- [ ] All TypeScript types and interfaces maintained
- [ ] No ESLint or TypeScript compilation errors

### Integration Requirements

- [ ] Components integrate properly with ServicesProvider context
- [ ] Components work with updated usePersonalitiesStore (dependency injection pattern)
- [ ] Error handling when services context not available
- [ ] Components work correctly within settings modal

## Unit Testing Requirements

- [ ] Update component tests to mock `useServices()` hook
- [ ] Remove `createLoggerSync` mocks from component tests
- [ ] Test logging functionality still works with mocked services
- [ ] Ensure existing form validation tests still pass
- [ ] Ensure existing personalities management tests still pass
- [ ] Add test for error case when services context missing

## Dependencies

- Requires T-update-usepersonalitiesstore to be completed (for personalities store initialization)
- Components must be used within ServicesProvider context

## Success Metrics

1. **Code Consistency**: Components use single logger configuration source
2. **Maintainability**: Simplified logger usage patterns
3. **Testability**: Easier mocking with centralized services
4. **Functionality**: All existing personalities features work exactly as before
