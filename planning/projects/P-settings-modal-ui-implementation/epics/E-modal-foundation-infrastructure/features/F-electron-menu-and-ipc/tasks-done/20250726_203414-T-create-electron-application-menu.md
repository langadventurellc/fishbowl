---
kind: task
id: T-create-electron-application-menu
parent: F-electron-menu-and-ipc
status: done
title: Create Electron application menu with Settings menu item
priority: normal
prerequisites:
  - T-implement-main-process-ipc
created: "2025-07-26T17:19:29.459568"
updated: "2025-07-26T20:19:47.929808"
schema_version: "1.1"
worktree: null
---

# Create Electron Application Menu with Settings Menu Item

## Context

Implement the native desktop application menu with a Settings menu item that triggers the settings modal. The menu should follow platform conventions (macOS vs Windows/Linux) and integrate with the IPC infrastructure to open the settings modal.

## Technical Approach

Extend `apps/desktop/src/electron/main.ts` to create a comprehensive application menu using Electron's Menu API. Implement platform-specific menu structures that follow native conventions while providing consistent Settings access.

## Implementation Requirements

### Update `apps/desktop/src/electron/main.ts`:

- Import `Menu` and `MenuItem` from electron
- Create platform-specific menu templates
- Add Settings menu item with IPC integration
- Configure menu during app initialization
- Follow native platform conventions

### Required Implementation:

```typescript
import { app, BrowserWindow, shell, ipcMain, Menu } from "electron";

function createApplicationMenu(): void {
  const isMac = process.platform === "darwin";

  const template = [
    // macOS app menu
    ...(isMac
      ? [
          {
            label: app.getName(),
            submenu: [
              { role: "about" },
              { type: "separator" },
              {
                label: "Settings",
                accelerator: "Cmd+,",
                click: () => openSettingsModal(),
              },
              { type: "separator" },
              { role: "services" },
              { type: "separator" },
              { role: "hide" },
              { role: "hideOthers" },
              { role: "unhide" },
              { type: "separator" },
              { role: "quit" },
            ],
          },
        ]
      : []),

    // File menu (Windows/Linux Settings location)
    {
      label: "File",
      submenu: [
        ...(isMac
          ? []
          : [
              {
                label: "Settings",
                accelerator: "Ctrl+,",
                click: () => openSettingsModal(),
              },
              { type: "separator" },
            ]),
        isMac ? { role: "close" } : { role: "quit" },
      ],
    },

    // Standard menus (Edit, View, Window, Help)
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "zoom" },
        ...(isMac
          ? [{ type: "separator" }, { role: "front" }]
          : [{ role: "close" }]),
      ],
    },
    {
      role: "help",
      submenu: [
        {
          label: "Learn More",
          click: async () => {
            await shell.openExternal("https://fishbowl-ai.com");
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Call during app initialization
app.whenReady().then(() => {
  createApplicationMenu();
  createMainWindow();
  // ... existing code
});
```

## Acceptance Criteria

- [ ] Application menu created with platform-specific structure
- [ ] Settings menu item appears in correct location (macOS: App menu, Windows/Linux: File menu)
- [ ] Settings menu item triggers `openSettingsModal()` function
- [ ] Menu follows platform conventions for layout and shortcuts
- [ ] Menu includes standard items (File, Edit, View, Window, Help)
- [ ] Menu integrates properly with existing application lifecycle
- [ ] No conflicts with existing `autoHideMenuBar: true` setting
- [ ] Menu remains functional after window recreation

## Dependencies

- **Prerequisite**: T-implement-main-process-ipc (requires `openSettingsModal` function)
- **Enables**: Complete menu-based settings access

## Security Considerations

- Menu click handlers only call authorized functions
- External links opened safely through `shell.openExternal`
- Menu configuration doesn't expose sensitive functionality
- Proper error handling prevents menu crashes

## Testing Requirements

- Unit tests for menu template generation
- Integration tests for Settings menu item click
- Platform-specific testing (macOS vs Windows/Linux)
- Menu accessibility testing

## Files to Modify

- `apps/desktop/src/electron/main.ts` - Add menu creation and configuration

## Platform Compatibility

- **macOS**: Settings in app menu with Cmd+, shortcut
- **Windows/Linux**: Settings in File menu with Ctrl+, shortcut
- Consistent Settings access regardless of platform
- Native look and feel on all platforms

### Log

**2025-07-27T01:34:14.899206Z** - Implemented complete Electron application menu system with Settings menu item, platform-specific keyboard shortcuts (Cmd/Ctrl+,), and global shortcut registration. Created Zustand store for settings modal state management with proper TypeScript interfaces following project's one-export-per-file convention. Integrated SettingsModal component into renderer process with IPC communication. All quality checks (lint, typecheck, format, tests) passing with 69 tests total.

- filesChanged: ["packages/shared/src/store/useSettingsModal.ts", "packages/shared/src/store/SettingsSection.ts", "packages/shared/src/store/SettingsModalState.ts", "packages/shared/src/store/SettingsModalActions.ts", "packages/shared/src/store/index.ts", "packages/shared/src/index.ts", "apps/desktop/src/electron/createApplicationMenu.ts", "apps/desktop/src/electron/setupApplicationMenu.ts", "apps/desktop/src/electron/registerGlobalShortcuts.ts", "apps/desktop/src/electron/main.ts", "apps/desktop/src/App.tsx", "apps/desktop/src/components/settings/SettingsModal.tsx", "apps/desktop/src/components/settings/SettingsNavigation.tsx"]
