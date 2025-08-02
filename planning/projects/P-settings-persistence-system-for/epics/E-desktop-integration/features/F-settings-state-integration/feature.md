---
kind: feature
id: F-settings-state-integration
title: Settings State Integration
status: done
priority: high
prerequisites:
  - F-ipc-communication-foundation
created: "2025-08-01T19:51:43.210443"
updated: "2025-08-01T19:51:43.210443"
schema_version: "1.1"
parent: E-desktop-integration
---

# Settings State Integration

## Purpose and Functionality

Create the bridge between the IPC communication layer and the settings persistence system by implementing a desktop-specific settings persistence adapter. This feature connects the main process IPC handlers to the settings repository from the shared package and creates the renderer-side adapter that uses IPC to perform settings operations. This establishes the complete data flow from UI components through IPC to file storage.

## Key Components to Implement

### 1. Desktop Settings Persistence Adapter

- Implement `SettingsPersistenceAdapter` interface for desktop platform
- Create adapter in `apps/desktop/src/adapters/desktopSettingsAdapter.ts`
- Use window.electronAPI.settings methods for all operations
- Handle IPC response transformation and error handling

### 2. Main Process Repository Integration

- Connect IPC handlers to `SettingsRepository` from shared package
- Initialize repository with proper file storage configuration
- Set userData directory path for settings file location
- Handle repository errors and transform for IPC responses

### 3. Settings File Configuration

- Configure settings file path in userData directory
- Use `app.getPath('userData')` for cross-platform compatibility
- Set filename as `preferences.json`
- Ensure proper file permissions and directory creation

### 4. IPC Handler Implementation

- Complete the placeholder IPC handlers from previous feature
- Implement actual load, save, and reset operations
- Transform repository responses to IPC response format
- Ensure atomic operations for data consistency

## Acceptance Criteria

### Functional Requirements

- ✓ Desktop adapter implements all SettingsPersistenceAdapter methods
- ✓ Main process handlers use SettingsRepository for operations
- ✓ Settings file is created in correct userData location
- ✓ Load operation retrieves persisted settings or returns defaults
- ✓ Save operation atomically updates settings file
- ✓ Reset operation clears settings and returns defaults
- ✓ All operations handle errors gracefully

### Integration Requirements

- ✓ Adapter integrates with useDesktopSettingsPersistence hook
- ✓ Works with existing type mappers from ui-shared
- ✓ Compatible with PersistedSettingsData format
- ✓ Maintains atomic operation semantics

### Data Flow Requirements

- ✓ UI → Adapter → IPC → Main Process → Repository → File System
- ✓ Errors propagate correctly through all layers
- ✓ Type safety maintained across boundaries
- ✓ Loading states properly communicated

## Technical Requirements

### Desktop Adapter Implementation

```typescript
export const desktopSettingsAdapter: SettingsPersistenceAdapter = {
  async save(settings: PersistedSettingsData): Promise<void> {
    const response = await window.electronAPI.settings.save(settings);
    if (!response.success) {
      throw new SettingsPersistenceError(response.error.message);
    }
  },

  async load(): Promise<PersistedSettingsData | null> {
    const response = await window.electronAPI.settings.load();
    if (!response.success) {
      throw new SettingsPersistenceError(response.error.message);
    }
    return response.data || null;
  },

  async reset(): Promise<void> {
    const response = await window.electronAPI.settings.reset();
    if (!response.success) {
      throw new SettingsPersistenceError(response.error.message);
    }
  },
};
```

### Main Process Setup

```typescript
// Initialize repository on app ready
let settingsRepository: SettingsRepository;

app.whenReady().then(() => {
  const settingsPath = path.join(app.getPath("userData"), "preferences.json");
  const fileStorage = new FileStorage(settingsPath);
  settingsRepository = new SettingsRepository(fileStorage);
});

// Connect handlers to repository
ipcMain.handle(SETTINGS_CHANNELS.LOAD, async () => {
  try {
    const settings = await settingsRepository.loadSettings();
    return { success: true, data: settings };
  } catch (error) {
    return { success: false, error: serializeError(error) };
  }
});
```

## Dependencies

- **F-ipc-communication-foundation**: Uses IPC channels and types defined there
- **@fishbowl-ai/shared**: Uses SettingsRepository and FileStorage
- **@fishbowl-ai/ui-shared**: Compatible with SettingsPersistenceAdapter interface

## Implementation Guidance

1. Start with the desktop adapter implementation
2. Set up repository initialization in main process
3. Connect IPC handlers to repository methods
4. Test full data flow from adapter to file system
5. Verify error handling at each layer

## Testing Requirements

- Unit tests for desktop adapter methods
- Unit tests for main process repository setup
- Integration tests for full save/load cycle
- Test error scenarios (file permissions, corrupted data)
- Verify userData directory usage

## Security Considerations

- Settings file should only be accessible by the application
- No path manipulation from renderer process
- Validate settings data structure before saving
- Sanitize error messages sent to renderer

## Performance Requirements

- File operations should be async and non-blocking
- Repository initialization should not delay app startup
- Cache settings in memory where appropriate

## Important Notes

- This feature connects all the layers but does NOT include UI integration
- Focus on data flow and error handling
- Settings file location must work across platforms (Windows, macOS, Linux)
- No performance or integration tests should be included in the implementation

### Log
