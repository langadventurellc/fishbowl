import { DatabaseMessage } from '../../schema/DatabaseMessage';
import { UuidSchema } from '../../../../shared/types/validation/databaseSchema/UuidSchema';
import { transactionManager } from '../../transactions/transactionManagerInstance';
import { Database } from 'better-sqlite3';

/**
 * Recovery operation that validates and fixes inconsistent message active states.
 * This function can be used to repair data integrity issues where the active state
 * may have become corrupted or inconsistent. All repairs are done atomically
 * within a transaction with automatic rollback on failure.
 *
 * @param options - Recovery options
 * @param options.conversationId - Optional: limit recovery to specific conversation
 * @param options.defaultActiveState - Default state for messages with null/invalid active state
 * @param options.dryRun - If true, return what would be changed without making changes
 * @returns { fixed: DatabaseMessage[]; errors: string[] } - Recovery results
 * @throws {Error} If conversation ID is invalid UUID format
 * @throws {Error} If database operation fails
 */
export function recoverMessageActiveStateConsistency(
  options: {
    conversationId?: string;
    defaultActiveState?: boolean;
    dryRun?: boolean;
  } = {},
): { fixed: DatabaseMessage[]; errors: string[] } {
  const {
    conversationId,
    defaultActiveState = true, // Default to active if not specified
    dryRun = false,
  } = options;

  // Validate inputs
  if (conversationId) {
    UuidSchema.parse(conversationId);
  }

  // Execute recovery within a transaction
  return transactionManager.executeTransaction((db: Database) => {
    let selectQuery = 'SELECT * FROM messages';
    const params: string[] = [];

    if (conversationId) {
      selectQuery += ' WHERE conversation_id = ?';
      params.push(conversationId);
    }

    selectQuery += ' ORDER BY timestamp ASC';

    const selectStmt = db.prepare(selectQuery);
    const allMessages = selectStmt.all(...params) as DatabaseMessage[];

    const inconsistentMessages: DatabaseMessage[] = [];
    const errors: string[] = [];

    // Find messages with inconsistent active states
    for (const message of allMessages) {
      let needsRepair = false;
      let newActiveState = message.is_active;

      // Check for null/undefined active state (shouldn't happen with schema constraints)
      if (message.is_active === null || message.is_active === undefined) {
        needsRepair = true;
        newActiveState = defaultActiveState;
        errors.push(
          `Message ${message.id}: null/undefined active state, setting to ${defaultActiveState}`,
        );
      }
      // Check for non-boolean values (shouldn't happen with proper validation)
      else if (typeof message.is_active !== 'boolean') {
        needsRepair = true;
        newActiveState = defaultActiveState;
        errors.push(
          `Message ${message.id}: invalid active state type '${typeof message.is_active}', setting to ${defaultActiveState}`,
        );
      }

      if (needsRepair) {
        const repairedMessage: DatabaseMessage = {
          ...message,
          is_active: newActiveState,
        };
        inconsistentMessages.push(repairedMessage);
      }
    }

    // If this is a dry run, return what would be changed without making changes
    if (dryRun) {
      return {
        fixed: inconsistentMessages,
        errors,
      };
    }

    // Apply repairs if any were found
    if (inconsistentMessages.length > 0) {
      const updateStmt = db.prepare('UPDATE messages SET is_active = ? WHERE id = ?');

      for (const message of inconsistentMessages) {
        const result = updateStmt.run(message.is_active ? 1 : 0, message.id);

        if (result.changes === 0) {
          throw new Error(`Failed to repair message ${message.id}: no rows updated`);
        }
      }
    }

    return {
      fixed: inconsistentMessages,
      errors,
    };
  });
}
