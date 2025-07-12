import { getDatabase } from '../../connection';
import { DatabaseMessage } from '../../schema/DatabaseMessage';
import { getMessageById } from './getMessageById';
import { DatabaseErrorHandler } from '../../../ipc/error-handler';
import { DatabaseOperationContext } from '../../../ipc/database-operation-context';
import { DatabaseError } from '../../../../shared/types/errors';
import { UuidSchema } from '../../../../shared/types/validation';

/**
 * Updates the active state of a message in the database.
 * Uses robust error handling with retry logic and proper transaction support.
 *
 * @param id - The UUID of the message to update
 * @param isActive - The new active state (true for active, false for inactive)
 * @returns The updated message object or null if the message was not found
 * @throws DatabaseError for database operation failures
 */
export async function updateMessageActiveState(
  id: string,
  isActive: boolean,
): Promise<DatabaseMessage | null> {
  const context: DatabaseOperationContext = {
    operation: 'update-active-state',
    table: 'messages',
    timestamp: Date.now(),
  };

  try {
    // Validate input parameters
    const validatedId = UuidSchema.parse(id);
    if (typeof isActive !== 'boolean') {
      throw new DatabaseError(
        'Invalid isActive parameter - must be boolean',
        'update-active-state',
        'messages',
        undefined,
        new Error(`Expected boolean, received ${typeof isActive}`),
      );
    }

    return await DatabaseErrorHandler.executeWithRetry((): DatabaseMessage | null => {
      const db = getDatabase();

      const updateStmt = db.prepare(`
        UPDATE messages 
        SET is_active = ? 
        WHERE id = ?
      `);

      const updateResult = updateStmt.run(isActive ? 1 : 0, validatedId);

      if (updateResult.changes === 0) {
        return null;
      }

      // Verify the update was successful by retrieving the updated message
      const updatedMessage = getMessageById(validatedId);
      if (!updatedMessage) {
        throw new DatabaseError(
          'Message update succeeded but message retrieval failed',
          'update-active-state',
          'messages',
          undefined,
          new Error('Inconsistent database state after update'),
        );
      }

      return updatedMessage;
    }, context);
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError(
      'Failed to update message active state',
      'update-active-state',
      'messages',
      undefined,
      error,
    );
  }
}
