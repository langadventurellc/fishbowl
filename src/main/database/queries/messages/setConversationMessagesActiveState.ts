import { DatabaseMessage } from '../../schema/DatabaseMessage';
import { UuidSchema } from '../../../../shared/types/validation/databaseSchema/UuidSchema';
import { transactionManager } from '../../transactions/transactionManagerInstance';
import { Database } from 'better-sqlite3';

/**
 * Sets the active state for all messages in a conversation atomically within a transaction.
 * This is useful for bulk operations like deactivating all messages in a conversation
 * or reactivating all messages for AI context inclusion.
 * If the operation fails, all changes are rolled back automatically.
 *
 * @param conversationId - UUID of the conversation
 * @param isActive - Boolean state to set for all messages in the conversation
 * @returns DatabaseMessage[] - Array of all updated messages in the conversation
 * @throws {Error} If conversation ID is invalid UUID format
 * @throws {Error} If no messages found in conversation
 * @throws {Error} If database operation fails
 */
export function setConversationMessagesActiveState(
  conversationId: string,
  isActive: boolean,
): DatabaseMessage[] {
  // Validate inputs before starting transaction (fail-fast principle)
  UuidSchema.parse(conversationId);
  if (typeof isActive !== 'boolean') {
    throw new Error('isActive must be a boolean value');
  }

  // Execute operation within a single transaction
  return transactionManager.executeTransaction((db: Database) => {
    // First, get all messages in the conversation to check if any exist
    const selectStmt = db.prepare(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC',
    );
    const currentMessages = selectStmt.all(conversationId) as DatabaseMessage[];

    if (currentMessages.length === 0) {
      throw new Error(`No messages found in conversation: ${conversationId}`);
    }

    // Update all messages in the conversation
    const updateStmt = db.prepare('UPDATE messages SET is_active = ? WHERE conversation_id = ?');

    const result = updateStmt.run(isActive ? 1 : 0, conversationId);

    if (result.changes === 0) {
      throw new Error(`Failed to update messages in conversation: ${conversationId}`);
    }

    // Return updated messages (re-query to get fresh data)
    const updatedMessages = selectStmt.all(conversationId) as DatabaseMessage[];

    // Verify that all messages now have the correct active state
    const incorrectMessages = updatedMessages.filter(message => message.is_active !== isActive);

    if (incorrectMessages.length > 0) {
      throw new Error(
        `Inconsistent state after update: ${incorrectMessages.length} messages have incorrect active state`,
      );
    }

    return updatedMessages;
  });
}
