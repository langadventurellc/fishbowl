---
id: T-update-usepersonalitiesstore
title: Update usePersonalitiesStore for logger dependency injection
status: open
priority: high
parent: F-logger-dependency-injection
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-18T15:27:01.525Z
updated: 2025-08-18T15:27:01.525Z
---

# Update usePersonalitiesStore for Logger Dependency Injection

## Context

Part of the logger dependency injection refactor to eliminate inconsistent logger usage. The `usePersonalitiesStore` currently uses lazy logger creation with fallbacks to avoid browser context issues. This task removes those patterns and implements proper dependency injection.

## Files to Modify

- `packages/ui-shared/src/stores/usePersonalitiesStore.ts`

## Technical Approach

### Current Pattern (to remove):

```typescript
// Lazy logger creation with try/catch fallback
let _logger: ReturnType<typeof createLoggerSync> | null = null;
const _getLogger = () => {
  if (!_logger) {
    try {
      _logger = createLoggerSync({...});
    } catch {
      _logger = {...} as ReturnType<typeof createLoggerSync>;
    }
  }
  return _logger;
};
```

### Target Pattern:

```typescript
// Store accepts logger via dependency injection
interface PersonalitiesStore {
  // ... existing properties
  initialize: (
    adapter: PersonalitiesAdapter,
    logger: IStructuredLogger,
  ) => void;
}
```

## Specific Implementation Requirements

### 1. Remove Lazy Logger Pattern

- Remove `_logger` module-level variable
- Remove `_getLogger` function
- Remove `createLoggerSync` import
- Remove try/catch fallback logger creation

### 2. Add Logger Parameter to Store Interface

- Add logger parameter to store initialization method
- Update store state interface to include logger
- Replace all internal `_getLogger()` calls with injected logger usage

### 3. Update Store Initialization

- Modify the `initialize` method to accept logger parameter: `initialize(adapter: PersonalitiesAdapter, logger: IStructuredLogger)`
- Store logger in zustand state for access by store methods
- Update all logging calls to use the injected logger instance

### 4. Maintain Existing Functionality

- Preserve all existing CRUD operations
- Maintain current error handling patterns (without logger fallbacks)
- Keep existing state management and UI integration intact

## Detailed Acceptance Criteria

### Functional Requirements

- [ ] `usePersonalitiesStore` no longer creates its own logger
- [ ] Store accepts logger via `initialize(adapter, logger)` method
- [ ] All internal logging uses injected logger instance
- [ ] No `createLoggerSync` import or usage in the file
- [ ] No lazy logger creation or fallback patterns
- [ ] All existing store functionality works unchanged

### Technical Requirements

- [ ] Remove imports: `import { createLoggerSync } from "@fishbowl-ai/shared"`
- [ ] Remove module variables: `_logger` and `_getLogger`
- [ ] Add logger parameter to initialization: `initialize(adapter: PersonalitiesAdapter, logger: IStructuredLogger)`
- [ ] Update store state to include logger: `logger: IStructuredLogger | null`
- [ ] Replace `_getLogger()` calls with `get().logger` access
- [ ] Maintain existing TypeScript interfaces and type safety

### Integration Points

- Desktop PersonalitiesProvider will need to pass logger during initialization
- Store must work without logger until initialization (graceful handling)
- Maintain compatibility with existing UI components that use the store

## Unit Testing Requirements

- [ ] Update existing tests to mock logger injection
- [ ] Test store initialization with logger parameter
- [ ] Verify logging calls use injected logger
- [ ] Test graceful handling when logger not yet injected
- [ ] Ensure all existing store functionality still works

## Dependencies

None - this is a foundational change that other components will build upon.

## Success Metrics

1. **Code Consistency**: Store uses dependency-injected logger exclusively
2. **No Browser Context Issues**: Eliminates try/catch fallback patterns
3. **Testability**: Logger easily mocked in tests
4. **Functionality**: All existing features work exactly as before
