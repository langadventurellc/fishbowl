/**
 * Update conversation
 */
import { getDatabase } from '../../connection';
import { DatabaseConversation } from '../../schema';
import { getConversationById } from './getConversationById';

export function updateConversation(
  id: string,
  updates: Partial<Omit<DatabaseConversation, 'id' | 'created_at' | 'updated_at'>>,
): DatabaseConversation | null {
  const db = getDatabase();
  const now = Date.now();

  const updateStmt = db.prepare(`
    UPDATE conversations 
    SET name = COALESCE(?, name),
        description = COALESCE(?, description),
        is_active = COALESCE(?, is_active),
        updated_at = ?
    WHERE id = ?
  `);

  const result = updateStmt.run(updates.name, updates.description, updates.is_active, now, id);

  if (result.changes === 0) {
    return null;
  }

  return getConversationById(id);
}
