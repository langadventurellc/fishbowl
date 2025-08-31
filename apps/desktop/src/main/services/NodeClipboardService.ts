import { clipboard } from "electron";
import type { ClipboardBridge } from "@fishbowl-ai/shared";

/**
 * Node.js/Electron main process clipboard implementation.
 *
 * Uses Electron's clipboard API to provide cross-platform clipboard access
 * in the main process. Handles platform-specific clipboard behavior and
 * provides consistent error handling.
 */
export class NodeClipboardService implements ClipboardBridge {
  /**
   * Write text to the system clipboard using Electron's clipboard API.
   *
   * Uses Electron's built-in clipboard module which handles platform
   * differences (Windows, macOS, Linux) automatically.
   */
  async writeText(text: string): Promise<void> {
    // Validate input
    if (typeof text !== "string") {
      throw new Error("Clipboard text must be a string");
    }

    try {
      // Electron's clipboard.writeText is synchronous but we wrap in Promise
      // for consistency with the ClipboardBridge interface
      clipboard.writeText(text);
    } catch (error) {
      throw new Error(
        `Failed to write to clipboard: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
