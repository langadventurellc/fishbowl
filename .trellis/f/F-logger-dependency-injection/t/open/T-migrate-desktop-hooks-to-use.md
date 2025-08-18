---
id: T-migrate-desktop-hooks-to-use
title: Migrate desktop hooks to use useServices() pattern
status: open
priority: medium
parent: F-logger-dependency-injection
prerequisites: []
affectedFiles: {}
log: []
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
