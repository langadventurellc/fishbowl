---
kind: task
id: T-initialize-settings-repository
title: Initialize Settings Repository in Main Process
status: open
priority: high
prerequisites: []
created: "2025-08-02T00:25:18.728250"
updated: "2025-08-02T00:25:18.728250"
schema_version: "1.1"
parent: F-settings-state-integration
---

# Initialize Settings Repository in Main Process

## Overview

Set up the SettingsRepository and FileStorageService in the main process during application initialization. This establishes the foundation for settings persistence by configuring the repository with the correct file path and storage service.

## Technical Requirements

### Implementation Location

- Modify: `apps/desktop/src/electron/main.ts`
- Update the app.whenReady() handler to initialize the repository

### Implementation Details

1. **Import Required Dependencies**

   ```typescript
   import { app } from "electron";
   import * as path from "path";
   import { SettingsRepository, FileStorageService } from "@fishbowl-ai/shared";
   ```

2. **Create Module-Level Repository Variable**

   ```typescript
   // Add at module level, after imports
   let settingsRepository: SettingsRepository | null = null;

   // Export getter function for use in handlers
   export function getSettingsRepository(): SettingsRepository {
     if (!settingsRepository) {
       throw new Error("Settings repository not initialized");
     }
     return settingsRepository;
   }
   ```

3. **Initialize Repository in app.whenReady()**

   ```typescript
   app.whenReady().then(async () => {
     // Initialize settings repository
     const userDataPath = app.getPath("userData");
     const settingsPath = path.join(userDataPath, "preferences.json");

     // Create file storage service with settings path
     const fileStorageService = new FileStorageService();

     // Initialize repository
     settingsRepository = new SettingsRepository(fileStorageService);

     // Existing code...
     createMainWindow();
     setupSettingsHandlers();
   });
   ```

4. **Handle Initialization Errors**
   - Wrap initialization in try-catch block
   - Log errors but don't crash the app
   - Settings will use defaults if initialization fails

## Unit Tests

Include unit tests in the same task:

- Create test file: `apps/desktop/src/electron/__tests__/main.test.ts` (if it doesn't exist)
- Mock electron's app module
- Mock @fishbowl-ai/shared imports
- Test successful initialization
- Test error handling during initialization
- Test getSettingsRepository() function behavior

## File System Considerations

- The userData directory is platform-specific:
  - Windows: `%APPDATA%/fishbowl`
  - macOS: `~/Library/Application Support/fishbowl`
  - Linux: `~/.config/fishbowl`
- Directory will be created automatically by Electron if it doesn't exist
- Settings file will be created on first save operation

## Acceptance Criteria

- ✓ SettingsRepository is initialized during app startup
- ✓ Repository uses correct userData path for settings file
- ✓ FileStorageService is properly configured
- ✓ Repository is accessible via getSettingsRepository() function
- ✓ Initialization errors are handled gracefully
- ✓ Unit tests cover initialization and error scenarios
- ✓ Code follows project conventions and passes linting

## Dependencies

- Uses SettingsRepository and FileStorageService from @fishbowl-ai/shared
- Must run after Electron app is ready
- Required by IPC handlers that will use the repository

## Important Notes

- Repository initialization should not delay app startup
- If initialization fails, app should continue with default settings
- The repository instance must be available before settings handlers are used
- **No performance tests should be included in this task**

### Log
