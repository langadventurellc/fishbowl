---
id: T-migrate-settings-components
title: Migrate settings components to use useServices() hook
status: open
priority: medium
parent: F-logger-dependency-injection
prerequisites:
  - T-update-settingsstore-for
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-18T15:27:50.644Z
updated: 2025-08-18T15:27:50.644Z
---

# Migrate Settings Components to use useServices() Hook

## Context

Part of the logger dependency injection refactor. These components currently create their own loggers using `createLoggerSync` instead of using the properly configured logger from RendererProcessServices via the `useServices()` hook.

## Files to Modify

- `apps/desktop/src/components/settings/SettingsContent.tsx`
- `apps/desktop/src/components/settings/TabContainer.tsx`
- `apps/desktop/src/components/settings/SettingsModal.tsx`
- `apps/desktop/src/components/settings/agents/AgentsSection.tsx`
- `apps/desktop/src/components/settings/agents/AgentForm.tsx`

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

### 3. Update Component Structure

- Move logger access inside React component function (not module-level)
- Ensure logger is accessible to all component methods that need it
- Pass logger to child components or utility functions as needed

### 4. Maintain Existing Functionality

- Preserve all existing component behavior
- Keep same logging calls and log levels
- Maintain error handling patterns
- Preserve component props and state management

## Implementation Details per Component

### SettingsContent.tsx

- Currently at line 35-37: Remove module-level logger
- Add `useServices()` hook inside SettingsContent component
- Update any logging calls within component methods

### TabContainer.tsx

- Currently at line 28-30: Remove module-level logger
- Add `useServices()` hook inside TabContainer component
- Update logging calls in event handlers and effects

### SettingsModal.tsx

- Currently at line 54-56: Remove module-level logger
- Add `useServices()` hook inside SettingsModal component
- Update logging calls throughout modal logic

### AgentsSection.tsx

- Currently at line 46-48: Remove module-level logger
- Add `useServices()` hook inside AgentsSection component
- Update logging calls in agent management logic

### AgentForm.tsx

- Currently at line 48-50: Remove module-level logger
- Add `useServices()` hook inside AgentForm component
- Update logging calls in form handling logic

## Detailed Acceptance Criteria

### Functional Requirements

- [ ] All 5 components use `useServices()` hook for logger access
- [ ] No `createLoggerSync` imports in any of the components
- [ ] No module-level logger creation in any component
- [ ] All existing functionality works unchanged
- [ ] Logging output remains consistent with previous behavior

### Technical Requirements

- [ ] Import `useServices` with correct relative paths
- [ ] Logger accessed via `const { logger } = useServices()` pattern
- [ ] Logger used within React component function scope only
- [ ] All TypeScript types and interfaces maintained
- [ ] No ESLint or TypeScript compilation errors

### Integration Requirements

- [ ] Components integrate properly with ServicesProvider context
- [ ] Error handling when services context not available (should not happen in normal usage)
- [ ] Components work correctly in existing application layout

## Unit Testing Requirements

- [ ] Update all component tests to mock `useServices()` hook
- [ ] Remove `createLoggerSync` mocks from individual component tests
- [ ] Test logging functionality still works with mocked services
- [ ] Ensure existing test scenarios still pass
- [ ] Add test for error case when services context missing

## Dependencies

- Requires T-update-settingsstore-for to be completed (for settings store initialization)
- Components must be used within ServicesProvider context

## Success Metrics

1. **Code Consistency**: All components use single logger configuration source
2. **Maintainability**: Simplified logger usage patterns across components
3. **Testability**: Easier mocking with centralized services
4. **Functionality**: All existing features work exactly as before
