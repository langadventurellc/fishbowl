import { DatabaseMessage } from '../../schema/DatabaseMessage';
import { UuidSchema } from '../../../../shared/types/validation/databaseSchema/UuidSchema';
import { transactionManager } from '../../transactions/transactionManagerInstance';
import { getMessageById } from './getMessageById';
import { Database } from 'better-sqlite3';

/**
 * Updates the active state for multiple messages atomically within a transaction.
 * If any update fails, all changes are rolled back automatically.
 *
 * @param updates - Array of objects containing messageId and isActive boolean
 * @returns DatabaseMessage[] - Array of updated messages
 * @throws {Error} If any message ID is invalid UUID format
 * @throws {Error} If any message is not found
 * @throws {Error} If database operation fails
 */
export function updateMultipleMessagesActiveState(
  updates: Array<{ messageId: string; isActive: boolean }>,
): DatabaseMessage[] {
  // Validate all inputs before starting transaction (fail-fast principle)
  for (const update of updates) {
    UuidSchema.parse(update.messageId);
    if (typeof update.isActive !== 'boolean') {
      throw new Error(`Invalid isActive value for message ${update.messageId}: must be boolean`);
    }
  }

  // Remove duplicates by messageId (keep last update for each message)
  const uniqueUpdates = new Map<string, boolean>();
  for (const update of updates) {
    uniqueUpdates.set(update.messageId, update.isActive);
  }
  const deduplicatedUpdates = Array.from(uniqueUpdates.entries()).map(([messageId, isActive]) => ({
    messageId,
    isActive,
  }));

  // Execute all updates within a single transaction
  return transactionManager.executeTransaction((db: Database) => {
    const updateStmt = db.prepare('UPDATE messages SET is_active = ? WHERE id = ?');

    const updatedMessages: DatabaseMessage[] = [];

    for (const { messageId, isActive } of deduplicatedUpdates) {
      // Update the message
      const result = updateStmt.run(isActive ? 1 : 0, messageId);

      if (result.changes === 0) {
        throw new Error(`Message not found: ${messageId}`);
      }

      // Retrieve updated message data
      const updatedMessage = getMessageById(messageId);
      if (!updatedMessage) {
        throw new Error(`Failed to retrieve updated message: ${messageId}`);
      }

      updatedMessages.push(updatedMessage);
    }

    return updatedMessages;
  });
}
