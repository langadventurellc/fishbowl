---
id: T-update-rolesprovider-to-use
title: Update RolesProvider to use services and inject logger
status: open
priority: medium
parent: F-logger-dependency-injection
prerequisites:
  - T-update-userolesstore-for
  - T-migrate-roles-components-to
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-18T15:29:26.363Z
updated: 2025-08-18T15:29:26.363Z
---

# Update RolesProvider to use Services and Inject Logger

## Context

Part of the logger dependency injection refactor. The RolesProvider currently creates its own logger and doesn't inject logger into the store initialization. This task updates it to use `useServices()` and properly initialize the store with dependency injection.

## Files to Modify

- `apps/desktop/src/contexts/RolesProvider.tsx`

## Technical Approach

### Current Pattern (to remove):

```typescript
import { createLoggerSync } from "@fishbowl-ai/shared";

const logger = createLoggerSync({
  config: { name: "RolesProvider", level: "info" },
});

export function RolesProvider({ children }: RolesProviderProps) {
  const store = useRolesStore();

  useEffect(() => {
    store.initialize(adapter); // No logger injection
  }, [store, adapter]);
}
```

### Target Pattern:

```typescript
import { useServices } from "./useServices";

export function RolesProvider({ children }: RolesProviderProps) {
  const { logger } = useServices();
  const store = useRolesStore();

  useEffect(() => {
    store.initialize(adapter, logger); // Inject logger
  }, [store, adapter, logger]);
}
```

## Specific Implementation Requirements

### 1. Update Imports

- Remove: `import { createLoggerSync } from "@fishbowl-ai/shared"`
- Add: `import { useServices } from "./useServices"` (adjust path as needed)
- Maintain all other existing imports

### 2. Replace Logger Creation with Services

- Remove module-level logger creation: `const logger = createLoggerSync(...)`
- Add `useServices()` hook usage inside RolesProvider function
- Extract logger from services: `const { logger } = useServices()`

### 3. Update Store Initialization

- Modify store initialization to include logger parameter
- Update the `useEffect` that calls `store.initialize()` to pass both adapter and logger
- Add logger to effect dependencies: `[store, adapter, logger]`

### 4. Maintain Existing Functionality

- Preserve all existing provider behavior
- Keep same component structure and props
- Maintain error handling patterns
- Preserve context provision to child components

## Implementation Details

### Store Initialization Pattern

```typescript
useEffect(() => {
  store.initialize(adapter, logger);
}, [store, adapter, logger]);
```

### Error Handling

- Maintain existing error handling for adapter initialization
- Add appropriate error handling for missing services context
- Preserve any existing fallback patterns (except logger creation)

### Context Provision

- Keep existing context provision patterns
- Ensure provider still properly wraps child components
- Maintain any existing provider-specific state management

## Detailed Acceptance Criteria

### Functional Requirements

- [ ] RolesProvider uses `useServices()` hook for logger access
- [ ] No `createLoggerSync` import or usage in the component
- [ ] No module-level logger creation
- [ ] Store initialization includes logger parameter: `store.initialize(adapter, logger)`
- [ ] All existing provider functionality works unchanged
- [ ] Provider still properly provides context to child components

### Technical Requirements

- [ ] Import `useServices` with correct relative path
- [ ] Logger accessed via `const { logger } = useServices()` pattern
- [ ] Logger passed to store initialization method
- [ ] Effect dependencies include logger: `[store, adapter, logger]`
- [ ] All TypeScript types and interfaces maintained
- [ ] No ESLint or TypeScript compilation errors

### Integration Requirements

- [ ] Provider must be used within ServicesProvider context
- [ ] Works with updated useRolesStore (dependency injection)
- [ ] Child components receive properly initialized roles context
- [ ] Error handling when services context not available

## Unit Testing Requirements

- [ ] Update provider tests to mock `useServices()` hook
- [ ] Remove `createLoggerSync` mocks from provider tests
- [ ] Test store initialization with logger parameter
- [ ] Verify logger is passed correctly to store.initialize()
- [ ] Ensure existing provider behavior tests still pass
- [ ] Test error case when services context missing

## Dependencies

- Requires T-update-userolesstore-for (store accepts logger parameter)
- Requires T-migrate-roles-components-to (components use updated patterns)
- Provider must be used within ServicesProvider context

## Success Metrics

1. **Code Consistency**: Provider uses single logger configuration source
2. **Proper Integration**: Store receives logger via dependency injection
3. **Testability**: Easier mocking with centralized services
4. **Functionality**: All existing roles features work exactly as before
