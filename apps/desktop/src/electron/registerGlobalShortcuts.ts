/**
 * Global Keyboard Shortcuts Registration
 *
 * Registers global keyboard shortcuts for the application including
 * Settings shortcut (Cmd/Ctrl+,) that works even when app is in background.
 *
 * @module electron/registerGlobalShortcuts
 */

import { globalShortcut } from "electron";
import { createLoggerSync } from "@fishbowl-ai/shared";
import { openSettingsModal } from "./main.js";

const logger = createLoggerSync({
  config: { name: "registerGlobalShortcuts", level: "info" },
});

/**
 * Registers all global keyboard shortcuts for the application.
 * Should be called after the app is ready.
 */
export function registerGlobalShortcuts(): void {
  try {
    const isMac = process.platform === "darwin";
    const settingsShortcut = isMac
      ? "CommandOrControl+,"
      : "CommandOrControl+,";

    // Register settings shortcut
    const registered = globalShortcut.register(settingsShortcut, () => {
      openSettingsModal();

      // Debug logging for development
      if (process.env.NODE_ENV === "development") {
        logger.debug(`Global shortcut ${settingsShortcut} triggered`);
      }
    });

    if (!registered) {
      logger.warn(`Failed to register global shortcut: ${settingsShortcut}`);
    } else if (process.env.NODE_ENV === "development") {
      logger.debug(`Global shortcut registered: ${settingsShortcut}`);
    }

    // Additional shortcuts can be registered here in the future
  } catch (error) {
    logger.error(
      "Failed to register global shortcuts:",
      error instanceof Error ? error : new Error(String(error)),
    );
  }
}
