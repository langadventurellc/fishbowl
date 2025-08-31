import type { ClipboardBridge } from "@fishbowl-ai/shared";

/**
 * Browser-based clipboard implementation for Electron renderer process.
 *
 * Uses the modern Clipboard API with fallback to legacy document.execCommand
 * for broader browser compatibility. Handles clipboard permissions and
 * security restrictions appropriately.
 */
export class BrowserClipboardService implements ClipboardBridge {
  /**
   * Write text to the system clipboard using browser APIs.
   *
   * Attempts to use the modern Clipboard API first, falling back to
   * the legacy execCommand approach if necessary.
   */
  async writeText(text: string): Promise<void> {
    // Validate input
    if (typeof text !== "string") {
      throw new Error("Clipboard text must be a string");
    }

    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch (error) {
        // Fall through to legacy method
        console.warn("Modern clipboard API failed, trying fallback:", error);
      }
    }

    // Fallback to legacy method
    await this.writeTextLegacy(text);
  }

  /**
   * Legacy clipboard implementation using document.execCommand.
   *
   * Creates a temporary textarea element, selects the text,
   * and uses execCommand to copy to clipboard.
   */
  private async writeTextLegacy(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Create temporary textarea element
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        textarea.style.pointerEvents = "none";

        // Add to DOM, select text, and copy
        document.body.appendChild(textarea);
        textarea.select();
        textarea.setSelectionRange(0, text.length);

        const success = document.execCommand("copy");

        // Clean up
        document.body.removeChild(textarea);

        if (success) {
          resolve();
        } else {
          reject(new Error("Legacy clipboard operation failed"));
        }
      } catch (error) {
        reject(
          new Error(
            `Clipboard operation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          ),
        );
      }
    });
  }
}
