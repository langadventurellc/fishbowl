import { DatabaseMessage } from '../../schema/DatabaseMessage';
import { UuidSchema } from '../../../../shared/types/validation/databaseSchema/UuidSchema';
import { transactionManager } from '../../transactions/transactionManagerInstance';
import { Database } from 'better-sqlite3';

/**
 * Toggles the active state for multiple messages atomically within a transaction.
 * Each message's current active state is read and then flipped to the opposite value.
 * If any operation fails, all changes are rolled back automatically.
 *
 * @param messageIds - Array of message IDs to toggle
 * @returns DatabaseMessage[] - Array of updated messages with their new states
 * @throws {Error} If any message ID is invalid UUID format
 * @throws {Error} If any message is not found
 * @throws {Error} If database operation fails
 */
export function toggleMultipleMessagesActiveState(messageIds: string[]): DatabaseMessage[] {
  // Validate all message IDs before starting transaction (fail-fast principle)
  for (const messageId of messageIds) {
    UuidSchema.parse(messageId);
  }

  // Remove duplicate message IDs
  const uniqueMessageIds = Array.from(new Set(messageIds));

  // Execute all toggles within a single transaction
  return transactionManager.executeTransaction((db: Database) => {
    const selectStmt = db.prepare('SELECT * FROM messages WHERE id = ?');
    const updateStmt = db.prepare('UPDATE messages SET is_active = ? WHERE id = ?');

    const updatedMessages: DatabaseMessage[] = [];

    for (const messageId of uniqueMessageIds) {
      // Read current message state
      const currentMessage = selectStmt.get(messageId) as DatabaseMessage | undefined;

      if (!currentMessage) {
        throw new Error(`Message not found: ${messageId}`);
      }

      // Toggle the active state (flip boolean)
      const newActiveState = !currentMessage.is_active;

      // Update the message
      const result = updateStmt.run(newActiveState ? 1 : 0, messageId);

      if (result.changes === 0) {
        throw new Error(`Failed to update message: ${messageId}`);
      }

      // Create updated message object
      const updatedMessage: DatabaseMessage = {
        ...currentMessage,
        is_active: newActiveState,
      };

      updatedMessages.push(updatedMessage);
    }

    return updatedMessages;
  });
}
