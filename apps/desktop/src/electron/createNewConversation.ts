/**
 * New Conversation Creation
 *
 * Helper function to send new conversation creation command to renderer process.
 * This function is called by menu items and keyboard shortcuts to trigger
 * new conversation creation in the renderer process.
 *
 * @module electron/createNewConversation
 */

import { BrowserWindow } from "electron";

/**
 * Helper function to send new conversation creation command to renderer process.
 * This function is called by menu items and keyboard shortcuts to trigger
 * new conversation creation in the renderer process.
 *
 * @throws {Error} Logs errors instead of throwing to prevent main process crashes
 */
export function createNewConversation(): void {
  // Get the main window from all open windows
  const mainWindow = BrowserWindow.getAllWindows()[0];

  if (mainWindow && !mainWindow.isDestroyed()) {
    try {
      mainWindow.webContents.send("new-conversation");

      // Debug logging for development
      if (process.env.NODE_ENV === "development") {
        console.debug("New conversation IPC message sent successfully");
      }
    } catch (error) {
      console.error("Failed to send new-conversation IPC message:", error);
    }
  } else {
    console.warn(
      "Cannot create new conversation: main window not available or destroyed",
    );
  }
}
