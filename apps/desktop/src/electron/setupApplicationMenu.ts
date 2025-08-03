/**
 * Application Menu Setup
 *
 * Sets up the application menu for the current platform.
 *
 * @module electron/setupApplicationMenu
 */

import { Menu } from "electron";
import { createLoggerSync } from "@fishbowl-ai/shared";
import { createApplicationMenu } from "./createApplicationMenu.js";

const logger = createLoggerSync({
  config: { name: "setupApplicationMenu", level: "info" },
});

/**
 * Sets up the application menu for the current platform.
 * Should be called after the app is ready.
 */
export function setupApplicationMenu(): void {
  try {
    const menu = createApplicationMenu();
    Menu.setApplicationMenu(menu);

    // Debug logging for development
    if (process.env.NODE_ENV === "development") {
      logger.debug("Application menu configured successfully");
    }
  } catch (error) {
    logger.error(
      "Failed to setup application menu:",
      error instanceof Error ? error : new Error(String(error)),
    );

    // Fallback to default menu to prevent complete menu loss
    Menu.setApplicationMenu(null);
  }
}
