/**
 * Delete conversation (soft delete)
 */
import { getDatabase } from '../../connection';

export function deleteConversation(id: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare('UPDATE conversations SET is_active = 0, updated_at = ? WHERE id = ?');
  const result = stmt.run(Date.now(), id);
  return result.changes > 0;
}
