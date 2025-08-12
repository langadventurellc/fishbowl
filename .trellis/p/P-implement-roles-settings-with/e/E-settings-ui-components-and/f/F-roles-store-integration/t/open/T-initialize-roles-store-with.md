---
id: T-initialize-roles-store-with
title: Initialize roles store with desktop adapter on app startup
status: open
priority: high
parent: F-roles-store-integration
prerequisites: []
affectedFiles: {}
log: []
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
