---
id: T-add-roles-api-to-electron
title: Add roles API to Electron preload script
status: open
priority: high
parent: F-desktop-adapter-implementation
prerequisites:
  - T-create-roles-ipc-constants
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-11T03:15:06.134Z
updated: 2025-08-11T03:15:06.134Z
---

# Add Roles API to Electron Preload Script

## Context

Expose the roles IPC functionality to the renderer process through the contextBridge API, following the existing pattern used for settings.

## Implementation Requirements

Update `apps/desktop/src/electron/preload.ts`:

### Context Bridge API Extension

Add to the existing electronAPI object:

```typescript
const electronAPI = {
  // ... existing APIs
  roles: {
    load: (): Promise<RolesLoadResponse> =>
      ipcRenderer.invoke(ROLES_CHANNELS.LOAD),

    save: (roles: PersistedRolesSettingsData): Promise<RolesSaveResponse> =>
      ipcRenderer.invoke(ROLES_CHANNELS.SAVE, { roles }),

    reset: (): Promise<RolesResetResponse> =>
      ipcRenderer.invoke(ROLES_CHANNELS.RESET),
  },
  // ... existing APIs
};
```

### Type Definitions

Update `apps/desktop/src/types/electron.d.ts`:

```typescript
interface ElectronAPI {
  // ... existing APIs
  roles: {
    load(): Promise<RolesLoadResponse>;
    save(roles: PersistedRolesSettingsData): Promise<RolesSaveResponse>;
    reset(): Promise<RolesResetResponse>;
  };
  // ... existing APIs
}
```

### Security Implementation

- Use contextBridge.exposeInMainWorld safely
- Validate all parameters before IPC invocation
- Never expose internal implementation details
- Follow Content Security Policy requirements

## Acceptance Criteria

- [ ] roles API added to electronAPI object in preload
- [ ] All three methods (load, save, reset) properly exposed
- [ ] TypeScript definitions updated for roles API
- [ ] Follows exact same pattern as existing settings API
- [ ] Proper parameter validation before IPC calls
- [ ] contextBridge security best practices followed
- [ ] Unit tests for preload API exposure
- [ ] Tests verify correct IPC channel invocation
- [ ] Tests validate parameter passing to main process

## Dependencies

- T-create-roles-ipc-constants (for channel constants and types)

## Testing Requirements

- Mock ipcRenderer.invoke to verify correct channel usage
- Test load() calls ROLES_CHANNELS.LOAD with no parameters
- Test save() calls ROLES_CHANNELS.SAVE with roles data
- Test reset() calls ROLES_CHANNELS.RESET with no parameters
- Test parameter validation and type safety
- Verify TypeScript definitions compile correctly
- Test contextBridge integration (if testable in environment)
