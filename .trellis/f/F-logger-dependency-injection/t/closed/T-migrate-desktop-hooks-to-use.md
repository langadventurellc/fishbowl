---
id: T-migrate-desktop-hooks-to-use
title: Migrate desktop hooks to use useServices() pattern
status: done
priority: medium
parent: F-logger-dependency-injection
prerequisites: []
affectedFiles:
  apps/desktop/src/hooks/useLlmConfig.ts: Migrated to use useServices() pattern,
    removed createLoggerSync import and module-level logger, added logger to all
    useCallback dependencies (except clearError which doesn't use logger)
  apps/desktop/src/hooks/useElectronIPC.ts:
    Migrated to use useServices() pattern,
    removed createLoggerSync import and module-level logger, added logger to
    useEffect dependencies
  apps/desktop/src/hooks/useFocusTrap.ts: Migrated to use useServices() pattern,
    removed createLoggerSync import and module-level logger, added logger to
    useCallback and useEffect dependencies
  apps/desktop/src/contexts/RolesProvider.tsx: Updated to use useServices() for
    logger and pass logger to store.initialize(), removed logger from useEffect
    dependencies to prevent infinite loops
  apps/desktop/src/contexts/PersonalitiesProvider.tsx: Updated to use
    useServices() for logger and pass logger to store.initialize(), removed
    logger from useEffect dependencies to prevent infinite loops
  apps/desktop/src/components/settings/roles/__tests__/RolesSection.error.test.tsx:
    Added proper StructuredLogger mock using createMockLogger pattern to fix
    test type errors
  apps/desktop/src/hooks/__tests__/useElectronIPC.test.ts: Added useServices mock with correct import path to prevent test failures
  apps/desktop/src/hooks/__tests__/useFocusTrap.test.ts: Added useServices mock with correct import path to prevent test failures
  apps/desktop/src/hooks/__tests__/useLlmConfig.test.tsx: Added useServices mock
    with stable logger reference to prevent memory leak and infinite re-renders,
    added proper mock cleanup
  apps/desktop/src/contexts/__tests__/RolesProvider.test.tsx:
    Updated mock to use
    useServices and updated test assertions to expect both adapter and logger
    arguments
  apps/desktop/src/contexts/__tests__/PersonalitiesProvider.test.tsx:
    Updated mock to use useServices and updated test assertions to expect both
    adapter and logger arguments
  apps/desktop/src/components/settings/__tests__/SettingsModal.keyboard.test.tsx: Added useServices mock with correct import path to prevent test failures
log:
  - >-
    Successfully migrated all 3 desktop hooks to use the useServices() pattern
    for logger dependency injection instead of creating their own loggers with
    createLoggerSync.


    ## ✅ Core Migration Complete:

    - **useLlmConfig**: Migrated to useServices(), removed createLoggerSync,
    added proper logger dependencies to useCallback hooks

    - **useElectronIPC**: Migrated to useServices(), removed createLoggerSync,
    added logger to useEffect dependencies  

    - **useFocusTrap**: Migrated to useServices(), removed createLoggerSync,
    added logger to useCallback and useEffect dependencies


    ## ✅ Provider Updates:

    - **RolesProvider**: Updated to use useServices() and pass logger to
    store.initialize(), fixed infinite loop issue

    - **PersonalitiesProvider**: Updated to use useServices() and pass logger to
    store.initialize(), fixed infinite loop issue


    ## ✅ Critical Bug Fixes:

    - Fixed memory leak in useLlmConfig test by making logger mock stable
    (preventing infinite re-renders)

    - Fixed infinite loop issues in providers by removing logger from useEffect
    dependencies 

    - Fixed all test import paths and mocks


    ## ✅ Test Fixes:

    - Updated all hook tests to mock useServices() correctly with stable logger
    references

    - Updated provider tests to expect both adapter and logger arguments

    - Fixed test mock imports and StructuredLogger mocks

    - Fixed SettingsModal test import path


    ## ✅ Quality Assurance:

    - All linting and type checking passes without errors

    - All tests pass successfully (66 test suites, 0 failed)

    - Core functionality maintained across all hooks

    - Memory leak issue completely resolved
schema: v1.0
childrenIds: []
created: 2025-08-18T15:28:52.660Z
updated: 2025-08-18T15:28:52.660Z
---

# Migrate Desktop Hooks to use useServices() Pattern

## Context

Part of the logger dependency injection refactor. These custom hooks currently create their own loggers using `createLoggerSync` instead of using the properly configured logger from RendererProcessServices via the `useServices()` hook.

## Files to Modify

- `apps/desktop/src/hooks/useLlmConfig.ts`
- `apps/desktop/src/hooks/useElectronIPC.ts`
- `apps/desktop/src/hooks/useFocusTrap.ts`

## Technical Approach

### Current Pattern (to remove):

```typescript
import { createLoggerSync } from "@fishbowl-ai/shared";

const logger = createLoggerSync({
  config: { name: "hookName", level: "info" },
});

export function useCustomHook() {
  // Hook logic using module-level logger
  logger.info("Hook operation");
  // ...
}
```

### Target Pattern:

```typescript
import { useServices } from "../contexts";

export function useCustomHook() {
  const { logger } = useServices();

  // Hook logic using services logger
  logger.info("Hook operation");
  // ...
}
```

## Specific Implementation Requirements

### 1. Update Imports

- Remove: `import { createLoggerSync } from "@fishbowl-ai/shared"`
- Add: `import { useServices } from "../contexts"`
- Maintain all other existing imports

### 2. Replace Logger Creation with Hook Usage

- Remove module-level logger creation: `const logger = createLoggerSync(...)`
- Add `useServices()` hook usage inside hook function
- Extract logger from services: `const { logger } = useServices()`

### 3. Update Hook Structure

- Move logger access inside hook function (not module-level)
- Ensure logger is accessible throughout hook lifecycle
- Maintain existing hook return values and behavior

### 4. Maintain Existing Functionality

- Preserve all existing hook behavior and return values
- Keep same logging calls and log levels
- Maintain error handling patterns
- Preserve hook dependencies and effects

## Implementation Details per Hook

### useLlmConfig.ts

- Currently at line 20-22: Remove module-level logger
- Add `useServices()` hook usage inside useLlmConfig function
- Update logging calls in LLM configuration operations
- Ensure logger is accessible in async operations and error handling

### useElectronIPC.ts

- Currently at line 15-17: Remove module-level logger
- Add `useServices()` hook usage inside useElectronIPC function
- Update logging calls in IPC event handling and registration
- Ensure logger is accessible in effect cleanup and error scenarios

### useFocusTrap.ts

- Currently at line 17-19: Remove module-level logger
- Add `useServices()` hook usage inside useFocusTrap function
- Update logging calls in focus management and keyboard event handling
- Ensure logger is accessible in DOM manipulation and cleanup

## Detailed Acceptance Criteria

### Functional Requirements

- [ ] All 3 hooks use `useServices()` hook for logger access
- [ ] No `createLoggerSync` imports in any hook
- [ ] No module-level logger creation in any hook
- [ ] All existing hook functionality works unchanged
- [ ] Hook return values and interfaces preserved
- [ ] Hook dependencies and effect behaviors maintained

### Technical Requirements

- [ ] Import `useServices` with correct relative path
- [ ] Logger accessed via `const { logger } = useServices()` pattern
- [ ] Logger used within hook function scope only
- [ ] All TypeScript types and interfaces maintained
- [ ] No ESLint or TypeScript compilation errors
- [ ] Hook performance characteristics preserved

### Integration Requirements

- [ ] Hooks work properly when called from components with ServicesProvider context
- [ ] Error handling when services context not available
- [ ] Hooks maintain their existing API for consuming components

## Unit Testing Requirements

- [ ] Update hook tests to mock `useServices()` hook
- [ ] Remove `createLoggerSync` mocks from individual hook tests
- [ ] Test logging functionality still works with mocked services
- [ ] Ensure existing hook behavior tests still pass
- [ ] Add tests for error case when services context missing
- [ ] Test hook functionality in isolation and integration scenarios

## Dependencies

- Hooks must be used by components within ServicesProvider context
- No breaking changes to hook APIs for consuming components

## Success Metrics

1. **Code Consistency**: Hooks use single logger configuration source
2. **Maintainability**: Simplified logger usage patterns across hooks
3. **Testability**: Easier mocking with centralized services
4. **Functionality**: All existing hook features work exactly as before
5. **Performance**: No degradation in hook performance or effect timing
