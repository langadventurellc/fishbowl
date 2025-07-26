---
kind: task
id: T-write-integration-tests-for-ipc
title: Write integration tests for IPC communication and menu functionality
status: open
priority: normal
prerequisites:
  - T-integrate-ipc-event-handlers
  - T-create-electron-application-menu
  - T-implement-keyboard-shortcut
created: "2025-07-26T17:21:03.263524"
updated: "2025-07-26T17:21:03.263524"
schema_version: "1.1"
parent: F-electron-menu-and-ipc
---

# Write Integration Tests for IPC Communication and Menu Functionality

## Context

Create comprehensive integration tests to verify the complete Electron menu and IPC functionality works correctly end-to-end. This ensures reliable operation of menu items, keyboard shortcuts, and IPC communication for opening the settings modal.

## Technical Approach

Use the existing Playwright E2E testing infrastructure to create integration tests that verify IPC communication, menu functionality, and keyboard shortcuts work correctly in the desktop application environment.

## Implementation Requirements

### Create Test File:

Create `apps/desktop/e2e/electron-menu-ipc.spec.ts` for comprehensive testing:

```typescript
import { test, expect } from "@playwright/test";
import { _electron as electron } from "playwright";
import path from "path";

test.describe("Electron Menu and IPC Integration", () => {
  let electronApp: any;
  let window: any;

  test.beforeAll(async () => {
    // Launch Electron app
    electronApp = await electron.launch({
      args: [path.join(__dirname, "../dist-electron/main.js")],
    });
    window = await electronApp.firstWindow();
  });

  test.afterAll(async () => {
    await electronApp.close();
  });

  test("should have application menu with Settings item", async () => {
    // Verify menu structure exists
    const menu = await electronApp.evaluate(({ Menu }) => {
      const appMenu = Menu.getApplicationMenu();
      return appMenu
        ? appMenu.items.map((item) => ({
            label: item.label,
            submenu: item.submenu
              ? item.submenu.items.map((subItem) => ({
                  label: subItem.label,
                  accelerator: subItem.accelerator,
                }))
              : null,
          }))
        : null;
    });

    expect(menu).toBeTruthy();

    // Find Settings menu item
    const hasSettingsItem = menu.some((menuItem) =>
      menuItem.submenu?.some(
        (subItem) =>
          subItem.label === "Settings" &&
          (subItem.accelerator === "Cmd+," || subItem.accelerator === "Ctrl+,"),
      ),
    );

    expect(hasSettingsItem).toBe(true);
  });

  test("should trigger settings modal via menu click", async () => {
    // Setup listener for IPC message
    let ipcMessageReceived = false;
    await window.evaluate(() => {
      window.electronAPI.onOpenSettings(() => {
        window.testIpcReceived = true;
      });
    });

    // Simulate menu click (this would need to be adapted based on test capabilities)
    await electronApp.evaluate(() => {
      const { Menu } = require("electron");
      const appMenu = Menu.getApplicationMenu();
      // Find and click Settings menu item
      // This is simplified - actual implementation may vary
    });

    // Verify IPC message was received
    const ipcReceived = await window.evaluate(() => window.testIpcReceived);
    expect(ipcReceived).toBe(true);
  });

  test("should trigger settings modal via keyboard shortcut", async () => {
    // Setup listener for IPC message
    await window.evaluate(() => {
      window.testIpcCount = 0;
      window.electronAPI.onOpenSettings(() => {
        window.testIpcCount++;
      });
    });

    // Simulate keyboard shortcut
    const platform = await electronApp.evaluate(() => process.platform);
    const shortcut = platform === "darwin" ? "Meta+," : "Control+,";

    await window.keyboard.press(shortcut);

    // Verify IPC message was received
    const ipcCount = await window.evaluate(() => window.testIpcCount);
    expect(ipcCount).toBeGreaterThan(0);
  });

  test("should handle multiple rapid IPC messages gracefully", async () => {
    // Setup counter for IPC messages
    await window.evaluate(() => {
      window.rapidTestCount = 0;
      window.electronAPI.onOpenSettings(() => {
        window.rapidTestCount++;
      });
    });

    // Send multiple IPC messages rapidly
    for (let i = 0; i < 5; i++) {
      await electronApp.evaluate(() => {
        const { BrowserWindow } = require("electron");
        const mainWindow = BrowserWindow.getAllWindows()[0];
        mainWindow.webContents.send("open-settings");
      });
    }

    // Verify all messages were handled
    await window.waitForTimeout(100); // Allow time for processing
    const finalCount = await window.evaluate(() => window.rapidTestCount);
    expect(finalCount).toBe(5);
  });

  test("should integrate with settings modal store", async () => {
    // Verify settings modal opens via IPC
    await window.evaluate(() => {
      // Mock settings modal store
      window.testModalOpened = false;
      if (window.useSettingsModal) {
        const originalOpenModal = window.useSettingsModal.getState().openModal;
        window.useSettingsModal.setState({
          openModal: (section) => {
            window.testModalOpened = true;
            window.testModalSection = section;
            originalOpenModal(section);
          },
        });
      }
    });

    // Trigger IPC message
    await electronApp.evaluate(() => {
      const { BrowserWindow } = require("electron");
      const mainWindow = BrowserWindow.getAllWindows()[0];
      mainWindow.webContents.send("open-settings");
    });

    // Verify modal store integration
    await window.waitForTimeout(100);
    const modalOpened = await window.evaluate(() => window.testModalOpened);
    const modalSection = await window.evaluate(() => window.testModalSection);

    expect(modalOpened).toBe(true);
    expect(modalSection).toBe("general");
  });

  test("should handle IPC errors gracefully", async () => {
    // Test error handling when window is destroyed
    const errorLogs = [];

    window.on("console", (msg) => {
      if (msg.type() === "error") {
        errorLogs.push(msg.text());
      }
    });

    // Simulate error condition
    await window.evaluate(() => {
      // Create error in IPC handler
      window.electronAPI.onOpenSettings(() => {
        throw new Error("Test IPC error");
      });
    });

    // Trigger IPC message
    await electronApp.evaluate(() => {
      const { BrowserWindow } = require("electron");
      const mainWindow = BrowserWindow.getAllWindows()[0];
      mainWindow.webContents.send("open-settings");
    });

    await window.waitForTimeout(100);

    // Verify error was handled gracefully (app didn't crash)
    const isVisible = await window.isVisible();
    expect(isVisible).toBe(true);
  });
});
```

### Unit Tests for Individual Components:

Create `apps/desktop/src/hooks/__tests__/useElectronIPC.test.ts`:

```typescript
import { renderHook } from "@testing-library/react";
import { useElectronIPC } from "../useElectronIPC";

// Mock Zustand store
jest.mock("@fishbowl-ai/shared", () => ({
  useSettingsModal: () => ({
    openModal: jest.fn(),
  }),
}));

describe("useElectronIPC", () => {
  beforeEach(() => {
    // Mock window.electronAPI
    global.window.electronAPI = {
      onOpenSettings: jest.fn(),
      removeAllListeners: jest.fn(),
    };
  });

  test("should setup IPC listener on mount", () => {
    renderHook(() => useElectronIPC());
    expect(window.electronAPI.onOpenSettings).toHaveBeenCalled();
  });

  test("should cleanup on unmount", () => {
    const { unmount } = renderHook(() => useElectronIPC());
    unmount();
    expect(window.electronAPI.removeAllListeners).toHaveBeenCalledWith(
      "open-settings",
    );
  });

  test("should handle missing electronAPI gracefully", () => {
    global.window.electronAPI = undefined;
    expect(() => renderHook(() => useElectronIPC())).not.toThrow();
  });
});
```

## Acceptance Criteria

- [ ] E2E tests verify complete IPC communication flow
- [ ] Menu integration tests confirm Settings menu item functionality
- [ ] Keyboard shortcut tests verify platform-specific shortcuts work
- [ ] Error handling tests ensure graceful failure scenarios
- [ ] Performance tests confirm IPC latency under 50ms
- [ ] Unit tests cover individual component functionality
- [ ] Integration tests verify settings modal store connection
- [ ] Cross-platform tests verify macOS vs Windows/Linux behavior

## Dependencies

- **Prerequisites**: All implementation tasks completed
- **Testing Framework**: Existing Playwright E2E infrastructure
- **Requires**: Built application for E2E testing

## Security Testing

- Verify IPC messages only trigger authorized actions
- Test that arbitrary IPC messages cannot be sent
- Confirm proper cleanup prevents security vulnerabilities
- Validate error handling doesn't expose sensitive information

## Testing Requirements

- **E2E Tests**: Complete user workflow testing
- **Unit Tests**: Individual component verification
- **Integration Tests**: Store and IPC interaction testing
- **Performance Tests**: IPC latency and responsiveness
- **Error Handling Tests**: Graceful failure scenarios

## Files to Create

- `apps/desktop/e2e/electron-menu-ipc.spec.ts` - E2E integration tests
- `apps/desktop/src/hooks/__tests__/useElectronIPC.test.ts` - Unit tests

## Performance Validation

- IPC message latency under 50ms
- Menu response time under 100ms
- Keyboard shortcut response under 100ms
- No memory leaks from event listeners
- Efficient error handling without performance impact

### Log
