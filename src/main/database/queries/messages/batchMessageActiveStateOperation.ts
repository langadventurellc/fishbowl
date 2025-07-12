import { DatabaseMessage } from '../../schema/DatabaseMessage';
import { Database } from 'better-sqlite3';
import { batchActiveStateOperation } from './batchActiveStateOperation';

/**
 * Specialized batch operation for message active state updates.
 * Provides type-safe interface for common message active state operations.
 *
 * @param messageOperations - Array of message-specific operations
 * @returns DatabaseMessage[] - Array of updated messages
 */
export function batchMessageActiveStateOperation(
  messageOperations: Array<{
    type: 'update' | 'toggle';
    messageId: string;
    isActive?: boolean; // Required for 'update', ignored for 'toggle'
  }>,
): DatabaseMessage[] {
  return batchActiveStateOperation(
    messageOperations.map(op => (db: Database) => {
      if (op.type === 'update') {
        if (op.isActive === undefined) {
          throw new Error(`isActive is required for update operation on message ${op.messageId}`);
        }

        const updateStmt = db.prepare('UPDATE messages SET is_active = ? WHERE id = ?');
        const result = updateStmt.run(op.isActive ? 1 : 0, op.messageId);

        if (result.changes === 0) {
          throw new Error(`Message not found: ${op.messageId}`);
        }

        // Return updated message
        const selectStmt = db.prepare('SELECT * FROM messages WHERE id = ?');
        const updatedMessage = selectStmt.get(op.messageId) as DatabaseMessage;
        if (!updatedMessage) {
          throw new Error(`Failed to retrieve updated message: ${op.messageId}`);
        }

        return updatedMessage;
      } else if (op.type === 'toggle') {
        // Read current state
        const selectStmt = db.prepare('SELECT * FROM messages WHERE id = ?');
        const currentMessage = selectStmt.get(op.messageId) as DatabaseMessage | undefined;

        if (!currentMessage) {
          throw new Error(`Message not found: ${op.messageId}`);
        }

        // Toggle the state
        const newActiveState = !currentMessage.is_active;
        const updateStmt = db.prepare('UPDATE messages SET is_active = ? WHERE id = ?');
        const result = updateStmt.run(newActiveState ? 1 : 0, op.messageId);

        if (result.changes === 0) {
          throw new Error(`Failed to update message: ${op.messageId}`);
        }

        return {
          ...currentMessage,
          is_active: newActiveState,
        };
      } else {
        throw new Error(`Invalid operation type: ${(op as { type: string }).type}`);
      }
    }),
    { validateBeforeTransaction: true, continueOnError: false },
  );
}
