import type { ClipboardBridge } from "../clipboard/ClipboardBridge";

/**
 * Service for performing actions on message content.
 *
 * Handles message-specific operations like copying content to clipboard,
 * with appropriate content sanitization and error handling. Uses dependency
 * injection to work across different platform implementations.
 */
export class MessageActionsService {
  constructor(private readonly clipboardBridge: ClipboardBridge) {}

  /**
   * Copy message content to the system clipboard.
   *
   * Sanitizes the content by removing markdown formatting and normalizing
   * whitespace before copying to ensure clean plain text output.
   *
   * @param content - The raw message content to copy
   * @throws {Error} When clipboard operation fails or content is invalid
   *
   * @example
   * ```typescript
   * const messageActions = new MessageActionsService(clipboardBridge);
   * await messageActions.copyMessageContent("**Bold text** with *italic*");
   * // Clipboard now contains: "Bold text with italic"
   * ```
   */
  async copyMessageContent(content: string): Promise<void> {
    // Validate input
    if (typeof content !== "string") {
      throw new Error("Message content must be a string");
    }

    if (content.trim().length === 0) {
      throw new Error("Cannot copy empty message content");
    }

    try {
      // Sanitize content before copying
      const sanitizedContent = this.sanitizeContent(content);

      // Copy to clipboard using injected bridge
      await this.clipboardBridge.writeText(sanitizedContent);
    } catch (error) {
      throw new Error(
        `Failed to copy message content: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Sanitize message content for clipboard operations.
   *
   * Removes markdown formatting, normalizes whitespace, and trims
   * unnecessary characters to provide clean plain text.
   *
   * @param content - Raw message content with potential markdown
   * @returns Clean plain text suitable for clipboard
   */
  private sanitizeContent(content: string): string {
    return (
      content
        // Remove markdown bold/italic formatting
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/__(.*?)__/g, "$1")
        .replace(/_(.*?)_/g, "$1")
        // Remove markdown links but keep link text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        // Remove inline code backticks
        .replace(/`([^`]+)`/g, "$1")
        // Remove code block markers
        .replace(/```[\s\S]*?```/g, (match) => {
          // Extract code content without language markers
          return match.replace(/```[^\n]*\n?/g, "").replace(/```/g, "");
        })
        // Normalize whitespace
        .replace(/\s+/g, " ")
        .trim()
    );
  }
}
