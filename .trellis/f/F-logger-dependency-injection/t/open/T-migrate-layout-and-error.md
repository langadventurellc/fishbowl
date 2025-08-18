---
id: T-migrate-layout-and-error
title: Migrate layout and error components to use useServices() hook
status: open
priority: medium
parent: F-logger-dependency-injection
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-18T15:28:34.852Z
updated: 2025-08-18T15:28:34.852Z
---

# Migrate Layout and Error Components to use useServices() Hook

## Context

Part of the logger dependency injection refactor. These components currently create their own loggers using `createLoggerSync` instead of using the properly configured logger from RendererProcessServices via the `useServices()` hook.

## Files to Modify

- `apps/desktop/src/components/sidebar/SidebarContainerDisplay.tsx`
- `apps/desktop/src/components/layout/MainContentPanelDisplay.tsx`
- `apps/desktop/src/components/errors/RolesErrorBoundary.tsx`

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
import { useServices } from "../../contexts"; // adjust path as needed

function Component() {
  const { logger } = useServices();
  // ... rest of component logic
}
```

## Specific Implementation Requirements

### 1. Update Imports

- Remove: `import { createLoggerSync } from "@fishbowl-ai/shared"`
- Add: `import { useServices } from "../../contexts"` (adjust path for each component)
- Maintain all other existing imports

### 2. Replace Logger Creation with Hook Usage

- Remove module-level logger creation: `const logger = createLoggerSync(...)`
- Add `useServices()` hook usage inside component function
- Extract logger from services: `const { logger } = useServices()`

### 3. Handle Special Cases

#### For RolesErrorBoundary (Class Component):

Since this is a class component and cannot use hooks directly, we need a different approach:

- Convert to function component with error boundary hooks, OR
- Use a higher-order component pattern to inject services, OR
- Accept logger as a prop from parent component

### 4. Maintain Existing Functionality

- Preserve all existing component behavior
- Keep same logging calls and log levels
- Maintain error handling patterns
- Preserve component props and rendering logic

## Implementation Details per Component

### SidebarContainerDisplay.tsx

- Currently at line 5-7: Remove module-level logger
- Add `useServices()` hook inside SidebarContainerDisplay component
- Update any logging calls within component methods

### MainContentPanelDisplay.tsx

- Currently at line 5-7: Remove module-level logger
- Add `useServices()` hook inside MainContentPanelDisplay component
- Update logging calls in panel rendering and state management

### RolesErrorBoundary.tsx (Special Case)

- Currently at line 4-6: Remove module-level logger
- **Option A**: Convert to function component using `react-error-boundary` library
- **Option B**: Accept logger as prop and update parent to pass it
- **Option C**: Use HOC pattern to inject services
- Recommend Option A: Convert to function component for consistency

## Detailed Acceptance Criteria

### Functional Requirements

- [ ] All 3 components use dependency-injected logger (via hook or props)
- [ ] No `createLoggerSync` imports in any component
- [ ] No module-level logger creation in any component
- [ ] All existing functionality works unchanged
- [ ] Error boundary still catches and logs errors properly

### Technical Requirements

- [ ] Import `useServices` with correct relative paths (for function components)
- [ ] Logger accessed via `const { logger } = useServices()` pattern or props
- [ ] Logger used within React component scope only
- [ ] All TypeScript types and interfaces maintained
- [ ] No ESLint or TypeScript compilation errors

### Special Requirements for RolesErrorBoundary

- [ ] Error boundary functionality preserved exactly
- [ ] Error logging still works in error scenarios
- [ ] Component integration with roles system unchanged
- [ ] Performance characteristics maintained

## Unit Testing Requirements

- [ ] Update component tests to mock `useServices()` hook
- [ ] Remove `createLoggerSync` mocks from component tests
- [ ] Test logging functionality still works with mocked services
- [ ] Ensure existing component behavior tests still pass
- [ ] For error boundary: Test error cases still log properly

## Dependencies

- Components must be used within ServicesProvider context
- For error boundary: May need to update parent components to provide context

## Success Metrics

1. **Code Consistency**: Components use single logger configuration source
2. **Maintainability**: Simplified logger usage patterns
3. **Testability**: Easier mocking with centralized services
4. **Functionality**: All existing features work exactly as before
