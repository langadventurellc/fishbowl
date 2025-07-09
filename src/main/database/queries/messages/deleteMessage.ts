/**
 * Delete message
 */
import { getDatabase } from '../../connection';

export function deleteMessage(id: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM messages WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}
