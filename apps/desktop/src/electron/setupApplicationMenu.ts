/**
 * Application Menu Setup
 *
 * Sets up the application menu for the current platform.
 *
 * @module electron/setupApplicationMenu
 */

import { Menu } from "electron";
import { createApplicationMenu } from "./createApplicationMenu.js";

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
      console.log("Application menu configured successfully");
    }
  } catch (error) {
    console.error("Failed to setup application menu:", error);

    // Fallback to default menu to prevent complete menu loss
    Menu.setApplicationMenu(null);
  }
}
