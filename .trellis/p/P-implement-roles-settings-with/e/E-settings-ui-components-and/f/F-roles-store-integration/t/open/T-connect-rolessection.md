---
id: T-connect-rolessection
title: Connect RolesSection component to useRolesStore hook
status: open
priority: high
parent: F-roles-store-integration
prerequisites:
  - T-initialize-roles-store-with
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-12T16:50:58.500Z
updated: 2025-08-12T16:50:58.500Z
---

# Connect RolesSection component to useRolesStore hook

## Context

Replace static `SAMPLE_ROLES` data in `apps/desktop/src/components/settings/roles/RolesSection.tsx` with live data from the `useRolesStore` hook. This establishes the fundamental data connection between UI and store.

## Technical Approach

- Import `useRolesStore` from `@fishbowl-ai/ui-shared`
- Remove `SAMPLE_ROLES` import and usage
- Subscribe to `store.roles` for role data display
- Subscribe to `store.isLoading` for loading state management
- Subscribe to `store.error` for error state display
- Use React.useMemo() or zustand selectors to optimize re-renders
- Follow React best practices for store subscriptions

## Implementation Details

Replace this pattern:

```jsx
// Current
import { SAMPLE_ROLES } from "@fishbowl-ai/ui-shared";
<RolesList roles={SAMPLE_ROLES} ... />
```

With:

```jsx
// New
import { useRolesStore } from "@fishbowl-ai/ui-shared";
const roles = useRolesStore((state) => state.roles);
const isLoading = useRolesStore((state) => state.isLoading);
const error = useRolesStore((state) => state.error);
<RolesList roles={roles} ... />
```

## Acceptance Criteria

- [ ] RolesSection reads role data from `store.roles`, not `SAMPLE_ROLES`
- [ ] Loading state displays when `store.isLoading` is true
- [ ] Error states from store display appropriately in UI
- [ ] Component re-renders automatically when store state changes
- [ ] No memory leaks from store subscriptions
- [ ] Store selectors used to minimize unnecessary re-renders
- [ ] Unit tests verify component connects to store correctly
- [ ] Integration tests confirm UI updates when store data changes

## Dependencies

- Requires store initialization task to be completed first
- Must maintain compatibility with existing `RolesList` component props

## Security Considerations

- Validate all data from store before rendering
- Sanitize any error messages before displaying to user
- Ensure no sensitive data exposed in development logs

## Testing Requirements

- Unit tests for store subscription and data display
- Test loading state rendering during store operations
- Verify error state displays when store has errors
- Confirm component properly unmounts and cleans up subscriptions
- Test that UI updates reflect store changes immediately
