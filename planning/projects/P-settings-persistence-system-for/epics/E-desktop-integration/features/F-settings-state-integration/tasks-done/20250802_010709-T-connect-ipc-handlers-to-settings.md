---
kind: task
id: T-connect-ipc-handlers-to-settings
parent: F-settings-state-integration
status: done
title: Connect IPC Handlers to Settings Repository
priority: high
prerequisites:
  - T-initialize-settings-repository
created: "2025-08-02T00:25:48.740248"
updated: "2025-08-02T01:01:31.201686"
schema_version: "1.1"
worktree: null
---

# Connect IPC Handlers to Settings Repository

## Overview

Replace the placeholder IPC handler implementations with actual repository operations. This task connects the IPC communication layer to the settings persistence system by updating the handlers to use SettingsRepository methods.

## Technical Requirements

### File to Modify

- Update: `apps/desktop/src/electron/settingsHandlers.ts`

### Implementation Details

1. **Import Dependencies**

   ```typescript
   import { getSettingsRepository } from "./main";
   import { PersistedSettingsData } from "@fishbowl-ai/shared";
   ```

2. **Update Load Handler**

   ```typescript
   ipcMain.handle(
     SETTINGS_CHANNELS.LOAD,
     async (_event): Promise<SettingsLoadResponse> => {
       try {
         const repository = getSettingsRepository();
         const settings = await repository.loadSettings();
         return { success: true, data: settings };
       } catch (error) {
         return { success: false, error: serializeError(error) };
       }
     },
   );
   ```

3. **Update Save Handler**

   ```typescript
   ipcMain.handle(
     SETTINGS_CHANNELS.SAVE,
     async (
       _event,
       request: SettingsSaveRequest,
     ): Promise<SettingsSaveResponse> => {
       try {
         const repository = getSettingsRepository();
         await repository.saveSettings(request.settings);
         return { success: true };
       } catch (error) {
         return { success: false, error: serializeError(error) };
       }
     },
   );
   ```

4. **Update Reset Handler**

   ```typescript
   ipcMain.handle(
     SETTINGS_CHANNELS.RESET,
     async (
       _event,
       request?: SettingsResetRequest,
     ): Promise<SettingsResetResponse> => {
       try {
         const repository = getSettingsRepository();

         // Reset by saving empty object (repository will merge with defaults)
         await repository.saveSettings({});

         // Load and return the reset settings
         const settings = await repository.loadSettings();
         return { success: true, data: settings };
       } catch (error) {
         return { success: false, error: serializeError(error) };
       }
     },
   );
   ```

5. **Remove Placeholder Code**
   - Remove the placeholderSettings constant
   - Remove the currentSettings variable
   - Remove all placeholder logic from handlers

## Error Handling

- Repository errors are automatically serialized by serializeError utility
- FileStorageError, SettingsValidationError, and WritePermissionError are handled
- Error messages are sanitized before sending to renderer

## Unit Tests

Include comprehensive unit tests in the same task:

- Update test file: `apps/desktop/src/electron/__tests__/settingsHandlers.test.ts`
- Mock getSettingsRepository function
- Mock repository methods (loadSettings, saveSettings)
- Test successful operations for all handlers
- Test error scenarios and serialization
- Test reset operation flow (save empty + load)
- Ensure proper error transformation

## Acceptance Criteria

- ✓ All IPC handlers use SettingsRepository instead of placeholders
- ✓ Load handler retrieves settings from repository
- ✓ Save handler persists settings through repository
- ✓ Reset handler clears settings and returns defaults
- ✓ All errors are properly caught and serialized
- ✓ Placeholder code is completely removed
- ✓ Unit tests cover all scenarios with mocked repository
- ✓ Code follows project conventions and passes linting

## Dependencies

- Requires T-initialize-settings-repository to be completed first
- Uses getSettingsRepository() function from main.ts
- Uses serializeError utility for error handling

## Important Notes

- Handlers must handle repository not being initialized gracefully
- The reset operation saves an empty object, letting repository apply defaults
- All operations are async and must be properly awaited
- **No performance tests should be included in this task**

### Log

**2025-08-02T06:07:09.893218Z** - Successfully connected IPC handlers to SettingsRepository, replacing placeholder implementations with actual persistence functionality. All three handlers (LOAD, SAVE, RESET) now use the repository for settings operations. The LOAD handler retrieves settings from repository, SAVE handler persists settings through repository, and RESET handler saves empty object then loads defaults as specified. Comprehensive unit tests created with proper repository mocking covering all success and error scenarios. All quality checks pass including build, lint, format, type-check, and tests.

- filesChanged: ["apps/desktop/src/electron/settingsHandlers.ts", "apps/desktop/src/electron/__tests__/settingsHandlers.test.ts"]
