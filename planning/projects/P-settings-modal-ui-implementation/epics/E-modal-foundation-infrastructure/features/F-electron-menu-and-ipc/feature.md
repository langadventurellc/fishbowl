---
kind: feature
id: F-electron-menu-and-ipc
title: Electron Menu and IPC Integration
status: done
priority: high
prerequisites:
  - F-settings-modal-state-management
created: "2025-07-26T01:12:39.174047"
updated: "2025-07-26T01:12:39.174047"
schema_version: "1.1"
parent: E-modal-foundation-infrastructure
---

# Electron Menu and IPC Integration

## Purpose and Functionality

Implement the Inter-Process Communication (IPC) infrastructure to enable the Electron main process to trigger the settings modal from the application menu and keyboard shortcuts. This feature establishes the bridge between the Electron menu system and the React-based settings modal, enabling users to access settings through native desktop application patterns.

## Settings Modal UI Specification

**IMPORTANT: Before beginning work on this feature, you MUST read and reference `docs/specifications/settings-modal-ui-spec.md`.** This document contains detailed design and functional requirements for the settings modal, including exact dimensions, layout specifications, navigation structure, content sections, and user experience considerations. All implementation work should follow the specifications outlined in this document. If you have questions about requirements, consult this specification first as it likely contains the answer.

## Key Components to Implement

### IPC Channel Setup

- Configure bidirectional IPC communication between main and renderer processes
- Implement 'open-settings' IPC channel for triggering modal display
- Set up proper event handling and error management for IPC messages
- Ensure secure and reliable message passing between processes

### Electron Main Process Menu Configuration

- Add "Settings" menu item to appropriate location in application menu (typically under "File" or dedicated "App" menu)
- Configure menu item with proper labeling, positioning, and visual styling
- Integrate menu item with IPC message sending to renderer process
- Ensure menu follows platform-specific conventions (macOS vs Windows/Linux)

### Keyboard Shortcut Implementation

- Implement Cmd/Ctrl+, (comma) keyboard shortcut for opening settings
- Register keyboard shortcut globally within Electron application
- Handle platform-specific keyboard combinations (Cmd on macOS, Ctrl on Windows/Linux)
- Ensure shortcut works regardless of current application focus

### Renderer Process IPC Handling

- Set up IPC event listeners in renderer process to receive settings open commands
- Integrate IPC handlers with Zustand store actions for modal opening
- Implement proper error handling and fallback behavior for IPC failures
- Ensure IPC integration doesn't interfere with normal React application flow

## Detailed Acceptance Criteria

### IPC Channel Configuration

- [ ] 'open-settings' IPC channel properly configured and documented
- [ ] IPC messages sent from main process received correctly in renderer
- [ ] Error handling prevents IPC failures from crashing the application
- [ ] IPC communication latency remains under 50ms for responsive user experience
- [ ] Message passing is secure and doesn't expose sensitive application data

### Electron Menu Integration

- [ ] Settings menu item added to appropriate location in application menu
- [ ] Menu item displays "Settings" label with proper capitalization
- [ ] Menu item positioned logically within menu structure (typically near "Preferences")
- [ ] Menu item triggers IPC message when clicked
- [ ] Menu follows platform-specific conventions and guidelines

### Keyboard Shortcut Functionality

- [ ] Cmd+, (macOS) and Ctrl+, (Windows/Linux) shortcuts properly registered
- [ ] Keyboard shortcut opens settings modal regardless of application focus
- [ ] Shortcut works consistently across different application states
- [ ] Shortcut doesn't conflict with existing application or system shortcuts
- [ ] Shortcut registration follows Electron best practices for global shortcuts

### Renderer Process Integration

- [ ] IPC event listener properly configured in renderer process
- [ ] IPC events trigger `openModal()` action in Zustand store
- [ ] Modal opens with correct default section when triggered via IPC
- [ ] Multiple rapid IPC messages handled gracefully without duplicate modals
- [ ] IPC integration is properly typed with TypeScript interfaces

### Cross-Platform Compatibility

- [ ] Menu integration works correctly on macOS, Windows, and Linux
- [ ] Keyboard shortcuts follow platform conventions (Cmd vs Ctrl)
- [ ] Menu positioning and labeling appropriate for each platform
- [ ] IPC communication reliable across all supported platforms
- [ ] No platform-specific bugs or inconsistencies in behavior

## Implementation Guidance

### Technical Approach

- Extend existing Electron main process configuration in `apps/desktop/src/electron/main.ts`
- Use Electron's Menu and MenuItem APIs for menu integration
- Implement IPC using Electron's `ipcMain` and `ipcRenderer` APIs
- Add TypeScript interfaces for IPC message types and payloads
- Follow existing project patterns for Electron process communication

### Main Process Implementation

```typescript
// In main.ts - Menu setup
import { Menu, MenuItem, ipcMain } from "electron";

const createApplicationMenu = () => {
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "Settings",
          accelerator: process.platform === "darwin" ? "Cmd+," : "Ctrl+,",
          click: () => {
            mainWindow?.webContents.send("open-settings");
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

// Global shortcut registration
import { globalShortcut } from "electron";

const registerGlobalShortcuts = () => {
  const shortcut = process.platform === "darwin" ? "Cmd+," : "Ctrl+,";

  globalShortcut.register(shortcut, () => {
    mainWindow?.webContents.send("open-settings");
  });
};
```

### Renderer Process Implementation

```typescript
// In renderer process - IPC event handling
useEffect(() => {
  const handleOpenSettings = () => {
    openModal("general"); // Default to General section
  };

  // Listen for IPC messages from main process
  window.electronAPI?.onOpenSettings?.(handleOpenSettings);

  return () => {
    // Cleanup IPC listeners
    window.electronAPI?.removeAllListeners?.("open-settings");
  };
}, [openModal]);
```

### TypeScript Interfaces

```typescript
// Define IPC message types
interface ElectronAPI {
  onOpenSettings: (callback: () => void) => void;
  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
```

### File Organization

- Extend `apps/desktop/src/electron/main.ts` for menu and IPC setup
- Extend `apps/desktop/src/electron/preload.ts` for secure IPC exposure
- Update `apps/desktop/src/types/electron.d.ts` for TypeScript interfaces
- Add IPC integration to settings modal component file

## Testing Requirements

### IPC Communication Testing

- [ ] IPC messages sent from main process received correctly in renderer
- [ ] Multiple rapid IPC messages handled without errors or duplicates
- [ ] IPC communication works reliably under various application states
- [ ] Error handling prevents IPC failures from affecting user experience
- [ ] IPC latency meets performance requirements (< 50ms)

### Menu Integration Testing

- [ ] Settings menu item appears in correct location across platforms
- [ ] Menu item click triggers settings modal opening
- [ ] Menu item remains functional after application state changes
- [ ] Menu follows platform-specific conventions and styling
- [ ] Menu integration doesn't interfere with other menu functionality

### Keyboard Shortcut Testing

- [ ] Cmd+, (macOS) opens settings modal reliably
- [ ] Ctrl+, (Windows/Linux) opens settings modal reliably
- [ ] Shortcut works when application has focus
- [ ] Shortcut works when application is in background (if desired)
- [ ] Shortcut doesn't conflict with system or other application shortcuts

### Cross-Platform Testing

- [ ] All functionality works correctly on macOS
- [ ] All functionality works correctly on Windows
- [ ] All functionality works correctly on Linux distributions
- [ ] Platform-specific behaviors (menu placement, shortcuts) work as expected
- [ ] No platform-specific regressions or bugs

## Security Considerations

### IPC Security

- Use contextIsolation and secure preload scripts to expose IPC safely
- Validate all IPC messages to prevent injection attacks
- Implement proper sandboxing for renderer process
- Ensure IPC channels don't expose sensitive main process functionality
- Follow Electron security best practices for IPC implementation

### Process Isolation

- Maintain proper separation between main and renderer processes
- Ensure renderer process can't execute arbitrary main process code
- Implement proper error boundaries to prevent process crashes
- Use secure IPC patterns to prevent privilege escalation

## Performance Requirements

### IPC Performance

- IPC message latency under 50ms for responsive user experience
- No memory leaks from IPC event listeners
- Efficient message serialization and deserialization
- Proper cleanup of IPC resources when application closes

### Menu and Shortcut Performance

- Menu creation and updates complete within 100ms
- Keyboard shortcut registration doesn't impact application startup time
- Global shortcut handling doesn't interfere with system responsiveness
- Menu interactions trigger IPC messages without noticeable delay

## Dependencies on Other Features

### Prerequisites

- **Settings Modal State Management** - Provides `openModal()` action for IPC integration

### Provides Integration For

- **All modal features** - Enables native desktop access to settings functionality
- **User experience** - Provides expected desktop application interaction patterns

## Integration Points

### With Settings Modal State Management

- IPC handlers call `openModal()` action from Zustand store
- Modal state management handles proper modal opening and section selection
- IPC integration is transparent to modal state management logic

### With Electron Application Architecture

- Extends existing main process menu configuration
- Uses established preload script patterns for secure IPC
- Follows existing TypeScript interfaces and project structure
- Integrates with application lifecycle and window management

### With Modal Shell Structure

- IPC triggers display the complete modal shell with navigation
- Default section selection can be specified via IPC message payload
- Modal opening through IPC provides same experience as other triggers

### With User Experience

- Provides native desktop application behavior (menu and keyboard shortcuts)
- Enables quick access to settings from anywhere in the application
- Follows platform conventions for settings access patterns
- Maintains consistent behavior across different access methods

### With Future Enhancements

- IPC infrastructure ready for additional main process integrations
- Menu structure extensible for additional settings-related menu items
- Keyboard shortcut system ready for additional application shortcuts
- IPC message system ready for more complex settings-related communications

### Log
