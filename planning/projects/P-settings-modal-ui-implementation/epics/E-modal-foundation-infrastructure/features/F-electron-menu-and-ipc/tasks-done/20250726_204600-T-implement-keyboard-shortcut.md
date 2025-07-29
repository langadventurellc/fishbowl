---
kind: task
id: T-implement-keyboard-shortcut
parent: F-electron-menu-and-ipc
status: done
title: Implement keyboard shortcut registration (Cmd/Ctrl+,)
priority: normal
prerequisites:
  - T-implement-main-process-ipc
created: "2025-07-26T17:19:53.952536"
updated: "2025-07-26T20:44:54.948872"
schema_version: "1.1"
worktree: null
---

# Implement Keyboard Shortcut Registration (Cmd/Ctrl+,)

## Context

Implement global keyboard shortcut registration for opening the settings modal using the standard platform conventions: Cmd+, on macOS and Ctrl+, on Windows/Linux. This provides quick access to settings regardless of application focus state.

## Technical Approach

Extend `apps/desktop/src/electron/main.ts` to register global keyboard shortcuts using Electron's `globalShortcut` API. Implement platform-specific shortcut patterns and proper cleanup to prevent conflicts with system shortcuts.

## Implementation Requirements

### Update `apps/desktop/src/electron/main.ts`:

- Import `globalShortcut` from electron
- Register platform-specific shortcuts during app initialization
- Implement proper cleanup on app termination
- Handle shortcut registration failures gracefully
- Add error handling and logging

### Required Implementation:

```typescript
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  Menu,
  globalShortcut,
} from "electron";

function registerGlobalShortcuts(): void {
  // Platform-specific shortcut for settings
  const settingsShortcut = process.platform === "darwin" ? "Cmd+," : "Ctrl+,";

  try {
    const registered = globalShortcut.register(settingsShortcut, () => {
      console.log(`Settings shortcut (${settingsShortcut}) pressed`);
      openSettingsModal();
    });

    if (!registered) {
      console.warn(`Failed to register settings shortcut: ${settingsShortcut}`);
    } else {
      console.log(
        `Successfully registered settings shortcut: ${settingsShortcut}`,
      );
    }

    // Verify registration
    if (globalShortcut.isRegistered(settingsShortcut)) {
      console.log(
        `Settings shortcut confirmed registered: ${settingsShortcut}`,
      );
    }
  } catch (error) {
    console.error(
      `Error registering settings shortcut (${settingsShortcut}):`,
      error,
    );
  }
}

function unregisterGlobalShortcuts(): void {
  try {
    globalShortcut.unregisterAll();
    console.log("All global shortcuts unregistered");
  } catch (error) {
    console.error("Error unregistering global shortcuts:", error);
  }
}

// Register shortcuts when app is ready
app.whenReady().then(() => {
  createApplicationMenu();
  registerGlobalShortcuts();
  createMainWindow();
  // ... existing code
});

// Cleanup on app termination
app.on("will-quit", () => {
  unregisterGlobalShortcuts();
});

app.on("before-quit", () => {
  unregisterGlobalShortcuts();
  mainWindow = null;
});
```

## Acceptance Criteria

- [ ] Cmd+, shortcut registered and functional on macOS
- [ ] Ctrl+, shortcut registered and functional on Windows/Linux
- [ ] Shortcuts trigger `openSettingsModal()` function correctly
- [ ] Shortcuts work regardless of application focus state
- [ ] Proper error handling for registration failures
- [ ] Cleanup prevents shortcut conflicts after app termination
- [ ] Registration status logged for debugging
- [ ] No conflicts with existing system or application shortcuts

## Dependencies

- **Prerequisite**: T-implement-main-process-ipc (requires `openSettingsModal` function)
- **Parallel**: Can be developed alongside menu implementation
- **Enables**: Complete keyboard-based settings access

## Security Considerations

- Global shortcuts only trigger authorized functions
- Proper cleanup prevents shortcut hijacking after app close
- Error handling prevents security-relevant failures
- Shortcut registration verified to prevent silent failures

## Testing Requirements

- Unit tests for shortcut registration logic
- Platform-specific testing (macOS Cmd+, vs Windows/Linux Ctrl+,)
- Integration tests with `openSettingsModal` function
- Testing shortcut cleanup on app termination
- Manual testing for global shortcut functionality

## Files to Modify

- `apps/desktop/src/electron/main.ts` - Add global shortcut registration

## Platform Compatibility

- **macOS**: Cmd+, (Command + comma)
- **Windows**: Ctrl+, (Control + comma)
- **Linux**: Ctrl+, (Control + comma)
- Consistent behavior across all platforms
- Follows platform-specific keyboard conventions

## Performance Considerations

- Shortcut registration during app startup (< 100ms)
- No impact on application responsiveness
- Efficient cleanup on app termination
- Minimal memory footprint for shortcut handling

### Log

**2025-07-27T01:46:00.400669Z** - Verified complete implementation of global keyboard shortcut registration (Cmd/Ctrl+,) for opening settings modal. All acceptance criteria met including cross-platform compatibility, proper error handling, global accessibility, and clean lifecycle management. Implementation uses CommandOrControl+, pattern and integrates seamlessly with existing openSettingsModal() function. All quality checks passing.

- filesChanged: ["apps/desktop/src/electron/registerGlobalShortcuts.ts", "apps/desktop/src/electron/main.ts"]
