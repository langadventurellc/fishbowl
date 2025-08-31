/**
 * Platform-abstracted clipboard operations interface.
 *
 * Provides a consistent interface for clipboard functionality across different
 * execution environments (browser renderer, Node.js main process, mobile).
 * Each platform implements this interface using appropriate clipboard APIs.
 *
 * @example
 * ```typescript
 * // In platform-specific service
 * const clipboard = new BrowserClipboardService();
 * await clipboard.writeText("Hello, clipboard!");
 * ```
 */
export interface ClipboardBridge {
  /**
   * Write text content to the system clipboard.
   *
   * @param text - The text content to copy to clipboard
   * @returns Promise resolving when clipboard write operation completes
   * @throws {Error} When clipboard API is unavailable or operation fails
   *
   * @example
   * ```typescript
   * try {
   *   await clipboardBridge.writeText("Message content to copy");
   *   console.log("Successfully copied to clipboard");
   * } catch (error) {
   *   console.error("Failed to copy:", error.message);
   * }
   * ```
   */
  writeText(text: string): Promise<void>;
}
