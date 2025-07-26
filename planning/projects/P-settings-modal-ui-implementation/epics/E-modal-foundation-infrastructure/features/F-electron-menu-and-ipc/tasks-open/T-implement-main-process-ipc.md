---
kind: task
id: T-implement-main-process-ipc
title: Implement main process IPC handlers for settings modal
status: open
priority: high
prerequisites:
  - T-create-ipc-channel
created: "2025-07-26T17:19:03.754593"
updated: "2025-07-26T17:19:03.754593"
schema_version: "1.1"
parent: F-electron-menu-and-ipc
---

# Implement Main Process IPC Handlers for Settings Modal

## Context

Create the main process side of IPC communication that receives settings modal requests and sends them to the renderer process. This enables menu items and keyboard shortcuts to trigger the 'open-settings' IPC message that the renderer will handle.

## Technical Approach

Extend the existing `apps/desktop/src/electron/main.ts` to include IPC handling infrastructure. Set up the foundation for menu items and keyboard shortcuts to send IPC messages to the renderer process.

## Implementation Requirements

### Update `apps/desktop/src/electron/main.ts`:

- Import `ipcMain` from electron (preparation for menu integration)
- Create helper function for sending settings open messages
- Implement proper error handling for IPC communication
- Ensure IPC setup happens before window creation
- Add debugging support for development

### Required Implementation:

```typescript
import { app, BrowserWindow, shell, ipcMain } from "electron";

// Helper function to send settings open command to renderer
function openSettingsModal(): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    try {
      mainWindow.webContents.send("open-settings");
    } catch (error) {
      console.error("Failed to send open-settings IPC message:", error);
    }
  } else {
    console.warn("Cannot open settings: main window not available");
  }
}

// Export for use by menu and keyboard shortcut handlers
export { openSettingsModal };
```

### Error Handling:

- Check window existence before sending IPC messages
- Handle webContents destruction gracefully
- Log errors for debugging without crashing application
- Provide fallback behavior when IPC fails

## Acceptance Criteria

- [ ] `ipcMain` imported and ready for use
- [ ] `openSettingsModal` helper function implemented
- [ ] Proper error handling prevents crashes when window unavailable
- [ ] IPC message sending works with existing window lifecycle
- [ ] Function exported for use by menu and keyboard handlers
- [ ] Error logging provides useful debugging information
- [ ] Implementation handles window destruction edge cases
- [ ] No memory leaks from IPC message handling

## Dependencies

- **Prerequisite**: T-create-ipc-channel (renderer-side IPC infrastructure)
- **Enables**: Menu and keyboard shortcut integration tasks

## Security Considerations

- Validates window state before sending IPC messages
- Implements proper error boundaries to prevent crashes
- Logs security-relevant events for debugging
- Ensures IPC messages only sent to intended renderer process

## Testing Requirements

- Unit tests for `openSettingsModal` function
- Error handling tests for destroyed windows
- Integration tests for IPC message sending
- Mock testing for webContents.send method

## Files to Modify

- `apps/desktop/src/electron/main.ts` - Add IPC helper functions

## Performance Considerations

- IPC message sending under 50ms
- No blocking operations in IPC handlers
- Efficient window state checking
- Minimal overhead for error handling

### Log
