---
kind: task
id: T-extend-preload-script-with
parent: F-ipc-communication-foundation
status: done
title: Extend preload script with settings API methods
priority: high
prerequisites:
  - T-create-ipc-channel-constants-and
created: "2025-08-01T20:02:19.680968"
updated: "2025-08-01T21:00:07.448605"
schema_version: "1.1"
worktree: null
---

# Extend Preload Script with Settings API Methods

## Context

This task extends the existing preload script to expose settings-specific API methods through `window.electronAPI`. Following the established pattern in `preload.ts`, this adds the settings operations that will be used by the desktop settings adapter in later features.

The existing preload script uses `contextBridge.exposeInMainWorld()` and the `ElectronAPI` interface pattern that we need to extend.

## Technical Approach

Extend the existing `electronAPI` object in `preload.ts` with a `settings` property containing the three operations (load, save, reset), and update the TypeScript interface accordingly.

## Detailed Implementation Requirements

### 1. Update ElectronAPI Interface

- **File**: `apps/desktop/src/types/electron.d.ts`
- **Add**: `settings` property to `ElectronAPI` interface
- **Pattern**: Follow existing interface structure with JSDoc comments

```typescript
export interface ElectronAPI {
  // ... existing properties
  /**
   * Settings persistence operations for communicating with main process.
   * Provides async methods for loading, saving, and resetting application settings.
   */
  settings: {
    /**
     * Load settings from persistent storage.
     * @returns Promise resolving to settings load response
     */
    load: () => Promise<SettingsLoadResponse>;
    /**
     * Save settings to persistent storage.
     * @param data - Settings data to persist
     * @returns Promise resolving to save response
     */
    save: (data: PersistedSettingsData) => Promise<SettingsSaveResponse>;
    /**
     * Reset settings to default values.
     * @returns Promise resolving to reset response
     */
    reset: () => Promise<SettingsResetResponse>;
  };
}
```

### 2. Extend Preload Script Implementation

- **File**: `apps/desktop/src/electron/preload.ts`
- **Pattern**: Add `settings` object to existing `electronAPI` implementation
- **Error Handling**: Wrap `ipcRenderer.invoke()` calls in try/catch blocks
- **Follow**: Same error handling pattern as existing `onOpenSettings` method

```typescript
const electronAPI: ElectronAPI = {
  // ... existing properties
  settings: {
    load: async (): Promise<SettingsLoadResponse> => {
      try {
        return await ipcRenderer.invoke(SETTINGS_CHANNELS.LOAD);
      } catch (error) {
        console.error("Error loading settings:", error);
        return {
          success: false,
          error: {
            message: "Failed to communicate with main process",
            code: "IPC_ERROR",
          },
        };
      }
    },
    save: async (
      data: PersistedSettingsData,
    ): Promise<SettingsSaveResponse> => {
      try {
        return await ipcRenderer.invoke(SETTINGS_CHANNELS.SAVE, { data });
      } catch (error) {
        console.error("Error saving settings:", error);
        return {
          success: false,
          error: {
            message: "Failed to communicate with main process",
            code: "IPC_ERROR",
          },
        };
      }
    },
    reset: async (): Promise<SettingsResetResponse> => {
      try {
        return await ipcRenderer.invoke(SETTINGS_CHANNELS.RESET);
      } catch (error) {
        console.error("Error resetting settings:", error);
        return {
          success: false,
          error: {
            message: "Failed to communicate with main process",
            code: "IPC_ERROR",
          },
        };
      }
    },
  },
};
```

### 3. Import Required Types

- Import `SETTINGS_CHANNELS` and response types from `../types/settingsIPC`
- Import `PersistedSettingsData` from `@fishbowl-ai/shared`
- Ensure all imports are properly typed

## Acceptance Criteria

- ✓ `ElectronAPI` interface extended with `settings` property
- ✓ Settings object contains three async methods (load, save, reset)
- ✓ All methods use `ipcRenderer.invoke()` with correct channel names
- ✓ All methods wrapped in try/catch blocks with error handling
- ✓ Error responses follow consistent structure with message and code
- ✓ TypeScript compilation passes without errors
- ✓ JSDoc comments provided for interface methods
- ✓ Follows existing preload script patterns and conventions

## Dependencies

- **T-create-ipc-channel-constants-and**: Uses channel constants and types
- Requires `SETTINGS_CHANNELS` from `settingsIPC.ts`
- Requires response types from `settingsIPC.ts`
- Requires `PersistedSettingsData` from `@fishbowl-ai/shared`

## Testing Requirements

- Write unit tests for each settings API method
- Mock `ipcRenderer.invoke()` to test successful scenarios
- Test error handling when IPC communication fails
- Verify correct channel names and parameters passed
- Test error response structure matches expected format

## Security Considerations

- Use `invoke/handle` pattern instead of `send/on` for better security
- Don't expose `ipcRenderer` directly to renderer process
- Maintain context isolation as established by existing code
- Validate that settings data structure is correct before IPC call

## Files to Modify

- **Modify**: `apps/desktop/src/types/electron.d.ts` (extend interface)
- **Modify**: `apps/desktop/src/electron/preload.ts` (add settings implementation)

## Implementation Notes

- Follow the same error handling pattern as `onOpenSettings` method
- Use `await` for all `ipcRenderer.invoke()` calls
- Keep consistent with existing code style and formatting
- Add proper TypeScript type annotations
- Consider adding validation for save data parameter

### Log

**2025-08-02T02:04:47.945681Z** - Extended Electron preload script with settings API methods. Added settings object to ElectronAPI interface with load, save, and reset methods. Each method uses secure IPC channels with proper error handling that converts IPC responses to thrown errors for consistent Promise-based error handling in the renderer process. Implementation follows existing preload patterns with comprehensive type safety and error serialization across process boundaries.

- filesChanged: ["apps/desktop/src/types/electron.d.ts", "apps/desktop/src/electron/preload.ts"]
