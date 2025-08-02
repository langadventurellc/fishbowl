---
kind: task
id: T-create-ipc-channel-constants-and
parent: F-ipc-communication-foundation
status: done
title: Create IPC channel constants and types for settings operations
priority: high
prerequisites: []
created: "2025-08-01T20:01:28.850805"
updated: "2025-08-01T20:10:06.108271"
schema_version: "1.1"
worktree: null
---

# Create IPC Channel Constants and Types for Settings Operations

## Context

This task establishes the foundational type definitions and channel constants that will be shared between the main and renderer processes for settings IPC communication. This follows the existing pattern in the codebase where types are defined in `/types/` and provides the contracts needed for later tasks.

## Technical Approach

Create `src/types/settingsIPC.ts` with channel constants and request/response type definitions that follow the existing `ElectronAPI` pattern in `electron.d.ts`.

## Detailed Implementation Requirements

### 1. Create Settings IPC Types File

- **File**: `apps/desktop/src/types/settingsIPC.ts`
- **Channel Constants**: Define `SETTINGS_CHANNELS` object with string constants
- **Request/Response Types**: Create TypeScript interfaces for each operation
- **Error Types**: Define standard error structure for IPC responses

### 2. Channel Definition Structure

```typescript
export const SETTINGS_CHANNELS = {
  LOAD: "settings:load",
  SAVE: "settings:save",
  RESET: "settings:reset",
} as const;
```

### 3. Response Type Structure

```typescript
export interface SettingsLoadResponse {
  success: boolean;
  data?: PersistedSettingsData;
  error?: { message: string; code: string };
}

export interface SettingsSaveResponse {
  success: boolean;
  error?: { message: string; code: string };
}

export interface SettingsResetResponse {
  success: boolean;
  error?: { message: string; code: string };
}
```

### 4. Request Type Structure

```typescript
export interface SettingsSaveRequest {
  data: PersistedSettingsData;
}
```

## Acceptance Criteria

- ✓ Channel constants defined with consistent naming pattern (`settings:operation`)
- ✓ Request/response interfaces created for all three operations (load, save, reset)
- ✓ Error structure includes message and code fields
- ✓ Types import `PersistedSettingsData` from shared package
- ✓ File follows existing TypeScript conventions in the codebase
- ✓ All interfaces exported for use by other modules

## Dependencies

- Import `PersistedSettingsData` from `@fishbowl-ai/shared`
- Must be completed before main process handlers can be implemented

## Testing Requirements

- No unit tests needed for type definitions
- Types will be validated through TypeScript compilation
- Usage will be tested in subsequent integration tasks

## Security Considerations

- Channel names should be scoped to settings operations only
- No sensitive data in type definitions
- Error types should not expose system internals

## Files to Create

- `apps/desktop/src/types/settingsIPC.ts`

## Implementation Notes

- Follow the same pattern as existing `electron.d.ts` file
- Use `as const` for channel constants to enable strict typing
- Keep response structures consistent across all operations
- Include JSDoc comments for complex types

### Log

**2025-08-02T01:28:38.537619Z** - Created IPC channel constants and types for settings operations. Implemented modular file structure with separate files for each type to comply with linting rules. All constants and type definitions are complete and working.

- filesChanged: ["apps/desktop/src/shared/ipc/constants.ts", "apps/desktop/src/shared/ipc/base.ts", "apps/desktop/src/shared/ipc/load.ts", "apps/desktop/src/shared/ipc/loadResponse.ts", "apps/desktop/src/shared/ipc/save.ts", "apps/desktop/src/shared/ipc/saveResponse.ts", "apps/desktop/src/shared/ipc/reset.ts", "apps/desktop/src/shared/ipc/resetResponse.ts", "apps/desktop/src/shared/ipc/data.ts", "apps/desktop/src/shared/ipc/settingsSection.ts", "apps/desktop/src/shared/ipc/index.ts"]
