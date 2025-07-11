import { getDatabase } from '../../connection';
import { DatabaseMessage } from '../../schema/DatabaseMessage';
import { getMessageById } from './getMessageById';

/**
 * Updates the active state of a message in the database.
 *
 * @param id - The UUID of the message to update
 * @param isActive - The new active state (true for active, false for inactive)
 * @returns The updated message object or null if the message was not found
 */
export function updateMessageActiveState(id: string, isActive: boolean): DatabaseMessage | null {
  const db = getDatabase();

  const updateStmt = db.prepare(`
    UPDATE messages 
    SET is_active = ? 
    WHERE id = ?
  `);

  const result = updateStmt.run(isActive ? 1 : 0, id);

  if (result.changes === 0) {
    return null;
  }

  return getMessageById(id);
}
