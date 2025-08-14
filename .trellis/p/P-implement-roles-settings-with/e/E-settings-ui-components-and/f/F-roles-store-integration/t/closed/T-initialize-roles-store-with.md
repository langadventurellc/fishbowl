---
id: T-initialize-roles-store-with
title: Initialize roles store with desktop adapter on app startup
status: done
priority: high
parent: F-roles-store-integration
prerequisites: []
affectedFiles:
  apps/desktop/src/contexts/RolesProvider.tsx:
    Updated RolesProvider to initialize
    useRolesStore with desktopRolesAdapter on mount, added loading and error
    states, proper error handling, and single initialization logic with cleanup
  apps/desktop/src/components/errors/RolesErrorBoundary.tsx: Created new error
    boundary component for graceful error handling with custom fallback support
    and error recovery
  apps/desktop/src/App.tsx:
    Updated to wrap RolesProvider with RolesErrorBoundary
    for comprehensive error handling
  apps/desktop/src/contexts/__tests__/RolesProvider.test.tsx: Updated unit tests
    to cover store initialization, loading states, error handling, and adapter
    context provision
  apps/desktop/src/components/errors/__tests__/RolesErrorBoundary.test.tsx:
    Created comprehensive unit tests for error boundary covering error catching,
    fallback UI, error recovery, and edge cases
log:
  - Implemented roles store initialization with desktop adapter on app startup.
    The RolesProvider now initializes the useRolesStore with desktopRolesAdapter
    when the desktop application starts, featuring comprehensive error handling,
    loading states, and single initialization per app session. Added robust
    error boundary for graceful failure handling and comprehensive unit tests
    for both components.
schema: v1.0
childrenIds: []
created: 2025-08-12T16:50:42.235Z
updated: 2025-08-12T16:50:42.235Z
---

# Initialize roles store with desktop adapter on app startup

## Context

The `useRolesStore` from ui-shared needs to be initialized with the `desktopRolesAdapter` when the desktop application starts. Currently, the `RolesProvider` exists but the store isn't connected to it.

## Technical Approach

- Modify the `RolesProvider` in `apps/desktop/src/contexts/RolesProvider.tsx` to initialize the roles store
- Call `useRolesStore.getState().initialize(desktopRolesAdapter)` during provider setup
- Add error boundary handling for store initialization failures
- Ensure store initializes once at app startup, not per component render

## Acceptance Criteria

- [ ] Store initializes with desktop adapter when app starts
- [ ] Initial data loads from roles.json file if it exists (handled by adapter)
- [ ] Store initialization errors display gracefully with fallback UI
- [ ] Loading state shows during initial data fetch
- [ ] Store state persists across settings modal open/close cycles
- [ ] Store initialization happens exactly once per app session
- [ ] Unit tests verify proper store initialization and error handling
- [ ] TypeScript types are correct for all store integration points

## Dependencies

- Must use existing `desktopRolesAdapter` from `apps/desktop/src/adapters/desktopRolesAdapter`
- Builds on existing `RolesProvider` infrastructure

## Security Considerations

- Store should not expose sensitive file paths in error messages
- All data from adapter should be validated before storing
- Error states should not leak internal implementation details

## Testing Requirements

- Unit tests for provider initialization logic and error handling
- Verify store correctly initializes with adapter
- Test error scenarios when adapter fails to initialize
- Confirm loading states work during initialization
