---
id: T-update-settingsstore-for
title: Update settingsStore for logger dependency injection
status: open
priority: high
parent: F-logger-dependency-injection
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-18T15:27:27.180Z
updated: 2025-08-18T15:27:27.180Z
---

# Update settingsStore for Logger Dependency Injection

## Context

Part of the logger dependency injection refactor to eliminate inconsistent logger usage. The `settingsStore` currently uses lazy logger creation with fallbacks to avoid browser context issues. This task removes those patterns and implements proper dependency injection.

## Files to Modify

- `packages/ui-shared/src/stores/settings/settingsStore.ts`

## Technical Approach

### Current Pattern (to remove):

```typescript
// Lazy logger creation with try/catch fallback
let logger: ReturnType<typeof createLoggerSync> | null = null;
const getLogger = () => {
  if (!logger) {
    try {
      logger = createLoggerSync({...});
    } catch {
      logger = {...} as ReturnType<typeof createLoggerSync>;
    }
  }
  return logger;
};
```

### Target Pattern:

```typescript
// Store accepts logger via dependency injection
interface SettingsStore {
  // ... existing properties
  initialize: (logger: IStructuredLogger) => void;
}
```

## Specific Implementation Requirements

### 1. Remove Lazy Logger Pattern

- Remove `logger` module-level variable
- Remove `getLogger` function
- Remove `createLoggerSync` import
- Remove try/catch fallback logger creation

### 2. Add Logger Parameter to Store Interface

- Add logger parameter to store initialization method (settings store may not have adapter parameter)
- Update store state interface to include logger
- Replace all internal `getLogger()` calls with injected logger usage

### 3. Update Store Initialization

- Add an `initialize` method if it doesn't exist, or modify existing initialization to accept logger parameter
- Store logger in zustand state for access by store methods
- Update all logging calls to use the injected logger instance

### 4. Maintain Existing Functionality

- Preserve all existing settings management operations
- Maintain current modal state management
- Keep existing error handling patterns (without logger fallbacks)
- Preserve settings sub-tab functionality

## Detailed Acceptance Criteria

### Functional Requirements

- [ ] `settingsStore` no longer creates its own logger
- [ ] Store accepts logger via initialization method
- [ ] All internal logging uses injected logger instance
- [ ] No `createLoggerSync` import or usage in the file
- [ ] No lazy logger creation or fallback patterns
- [ ] All existing store functionality works unchanged

### Technical Requirements

- [ ] Remove imports: `import { createLoggerSync } from "@fishbowl-ai/shared"`
- [ ] Remove module variables: `logger` and `getLogger`
- [ ] Add logger parameter to initialization method
- [ ] Update store state to include logger: `logger: IStructuredLogger | null`
- [ ] Replace `getLogger()` calls with `get().logger` access
- [ ] Maintain existing TypeScript interfaces and type safety

### Integration Points

- Desktop components using settings store will need to initialize with logger
- Store must work without logger until initialization (graceful handling)
- Maintain compatibility with existing UI components that use settings

## Unit Testing Requirements

- [ ] Update existing tests to mock logger injection
- [ ] Test store initialization with logger parameter
- [ ] Verify logging calls use injected logger
- [ ] Test graceful handling when logger not yet injected
- [ ] Ensure all existing settings functionality still works

## Dependencies

None - this is a foundational change that other components will build upon.

## Success Metrics

1. **Code Consistency**: Store uses dependency-injected logger exclusively
2. **No Browser Context Issues**: Eliminates try/catch fallback patterns
3. **Testability**: Logger easily mocked in tests
4. **Functionality**: All existing settings features work exactly as before
