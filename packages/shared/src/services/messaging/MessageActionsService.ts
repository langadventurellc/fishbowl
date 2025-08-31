import type { ClipboardBridge } from "../clipboard/ClipboardBridge";
import type { DatabaseBridge } from "../database/DatabaseBridge";
import { MessageNotFoundError } from "../../types/messages";

/**
 * Service for performing actions on message content.
 *
 * Handles message-specific operations like copying content to clipboard
 * and deleting messages from the database. Uses dependency injection
 * to work across different platform implementations.
 */
export class MessageActionsService {
  constructor(
    private readonly clipboardBridge: ClipboardBridge,
    private readonly databaseBridge: DatabaseBridge,
  ) {}

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
  /**
   * Delete a message from the database.
   *
   * Validates the message ID format and existence before attempting deletion.
   * Provides clear error messages for different failure scenarios.
   *
   * @param messageId - The ID of the message to delete
   * @throws {MessageNotFoundError} When message ID is invalid or message doesn't exist
   * @throws {Error} When database operation fails
   *
   * @example
   * ```typescript
   * const messageActions = new MessageActionsService(clipboardBridge, databaseBridge);
   * await messageActions.deleteMessage("550e8400-e29b-41d4-a716-446655440000");
   * ```
   */
  async deleteMessage(messageId: string): Promise<void> {
    // Validate input
    if (typeof messageId !== "string") {
      throw new Error("Message ID must be a string");
    }

    if (messageId.trim().length === 0) {
      throw new Error("Message ID cannot be empty");
    }

    try {
      // Check if message exists before attempting deletion
      const existsQuery = `
        SELECT 1
        FROM messages
        WHERE id = ?
        LIMIT 1
      `;

      const existsResult = await this.databaseBridge.query<{ 1: number }>(
        existsQuery,
        [messageId],
      );

      if (existsResult.length === 0) {
        throw new MessageNotFoundError(messageId);
      }

      // Delete message from database
      const deleteQuery = `
        DELETE FROM messages
        WHERE id = ?
      `;

      const result = await this.databaseBridge.execute(deleteQuery, [
        messageId,
      ]);

      // Verify deletion occurred
      if (result.changes === 0) {
        throw new MessageNotFoundError(messageId);
      }
    } catch (error) {
      if (error instanceof MessageNotFoundError) {
        throw error;
      }

      throw new Error(
        `Failed to delete message: ${error instanceof Error ? error.message : "Unknown error"}`,
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
