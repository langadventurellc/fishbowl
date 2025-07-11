import { DatabaseMessage } from '../../schema/DatabaseMessage';
import { transactionManager } from '../../transactions/transactionManagerInstance';
import { DatabaseErrorHandler } from '../../../ipc/error-handler';
import { DatabaseOperationContext } from '../../../ipc/database-operation-context';
import { DatabaseError } from '../../../../shared/types/errors';
import { UuidSchema } from '../../../../shared/types/validation';

/**
 * Toggles the active state of a message in the database.
 * If the message is currently active, it will be set to inactive.
 * If the message is currently inactive, it will be set to active.
 * Uses transaction support to ensure atomicity and prevent race conditions.
 *
 * @param id - The UUID of the message to toggle
 * @returns The updated message object with toggled active state, or null if the message was not found
 * @throws DatabaseError for database operation failures
 */
export async function toggleMessageActiveState(id: string): Promise<DatabaseMessage | null> {
  const context: DatabaseOperationContext = {
    operation: 'toggle-active-state',
    table: 'messages',
    timestamp: Date.now(),
  };

  try {
    // Validate input parameters
    const validatedId = UuidSchema.parse(id);

    return await DatabaseErrorHandler.executeWithRetry((): DatabaseMessage | null => {
      // Use transaction to ensure atomicity of read-modify-write operation
      return transactionManager.executeTransaction<DatabaseMessage | null>(db => {
        // Read current state within transaction using the transaction's database instance
        const selectStmt = db.prepare('SELECT * FROM messages WHERE id = ?');
        const currentMessage = selectStmt.get(validatedId) as DatabaseMessage | undefined;

        if (!currentMessage) {
          return null;
        }

        const newActiveState = !currentMessage.is_active;

        // Update state within same transaction
        const updateStmt = db.prepare(`
          UPDATE messages 
          SET is_active = ? 
          WHERE id = ?
        `);

        const updateResult = updateStmt.run(newActiveState ? 1 : 0, validatedId);

        if (updateResult.changes === 0) {
          throw new DatabaseError(
            'Failed to toggle message active state - no changes made',
            'toggle-active-state',
            'messages',
            undefined,
            new Error('Update statement did not affect any rows'),
          );
        }

        // Return the updated message using the transaction's database instance
        const updatedMessage = selectStmt.get(validatedId) as DatabaseMessage | undefined;
        if (!updatedMessage) {
          throw new DatabaseError(
            'Message toggle succeeded but message retrieval failed',
            'toggle-active-state',
            'messages',
            undefined,
            new Error('Inconsistent database state after toggle'),
          );
        }

        return updatedMessage;
      });
    }, context);
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError(
      'Failed to toggle message active state',
      'toggle-active-state',
      'messages',
      undefined,
      error,
    );
  }
}
