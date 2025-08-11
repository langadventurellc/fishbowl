---
id: T-create-roles-ipc-constants
title: Create roles IPC constants and types
status: open
priority: high
parent: F-desktop-adapter-implementation
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-11T03:14:19.644Z
updated: 2025-08-11T03:14:19.644Z
---

# Create Roles IPC Constants and Types

## Context

Establish the communication contract between renderer and main processes for roles persistence, following the existing pattern used by settings.

## Implementation Requirements

Create the IPC channels and TypeScript types in `apps/desktop/src/shared/ipc/constants.ts`:

### IPC Channels

```typescript
export const ROLES_CHANNELS = {
  LOAD: "roles:load",
  SAVE: "roles:save",
  RESET: "roles:reset",
} as const;

export type RolesChannelType =
  (typeof ROLES_CHANNELS)[keyof typeof ROLES_CHANNELS];
```

### Request/Response Types

Create types in `apps/desktop/src/shared/ipc/types.ts`:

- `RolesLoadResponse` - Success/error response for load operations
- `RolesSaveRequest` - Save operation parameters
- `RolesSaveResponse` - Success/error response for save operations
- `RolesResetResponse` - Success/error response for reset operations

Follow the same pattern as existing `Settings*Response` types with `success: boolean` and `error?: SerializedError` fields.

### Export Updates

Update `apps/desktop/src/shared/ipc/index.ts` to export the new constants and types.

## Acceptance Criteria

- [ ] ROLES_CHANNELS constants defined following settings pattern
- [ ] All request/response types properly typed with generics
- [ ] Types include proper error handling with SerializedError
- [ ] Constants and types exported from ipc/index.ts
- [ ] Follows exact same structure as SETTINGS_CHANNELS
- [ ] Unit tests verify type correctness and channel values

## Dependencies

- None (foundation task)

## Testing Requirements

- Unit tests for channel constant values
- Type tests for request/response interfaces
- Verify exports are accessible from index
