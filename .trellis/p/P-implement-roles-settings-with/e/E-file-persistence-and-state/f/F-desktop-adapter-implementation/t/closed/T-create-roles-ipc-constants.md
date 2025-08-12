---
id: T-create-roles-ipc-constants
title: Create roles IPC constants and types
status: done
priority: high
parent: F-desktop-adapter-implementation
prerequisites: []
affectedFiles:
  apps/desktop/src/shared/ipc/rolesConstants.ts: New file - ROLES_CHANNELS
    constants and RolesChannelType following llmConfig pattern
  apps/desktop/src/shared/ipc/roles/loadRequest.ts: New file - RolesLoadRequest interface for load operations
  apps/desktop/src/shared/ipc/roles/saveRequest.ts: New file - RolesSaveRequest
    interface with PersistedRolesSettingsData parameter
  apps/desktop/src/shared/ipc/roles/resetRequest.ts: New file - RolesResetRequest interface for reset operations
  apps/desktop/src/shared/ipc/roles/loadResponse.ts:
    New file - RolesLoadResponse
    extending IPCResponse<PersistedRolesSettingsData>
  apps/desktop/src/shared/ipc/roles/saveResponse.ts: New file - RolesSaveResponse extending IPCResponse<void>
  apps/desktop/src/shared/ipc/roles/resetResponse.ts: New file -
    RolesResetResponse extending IPCResponse<PersistedRolesSettingsData>
  apps/desktop/src/shared/ipc/index.ts: Updated - Added exports for
    ROLES_CHANNELS, RolesChannelType, and all roles request/response types
log:
  - Implemented complete IPC constants and types system for roles persistence
    operations, following the exact pattern established by settings. Created
    dedicated rolesConstants.ts file to avoid multiple exports lint violations.
    All request/response types properly extend IPCResponse with SerializedError
    support. Comprehensive type system enables type-safe communication between
    renderer and main processes for file-based roles management.
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
