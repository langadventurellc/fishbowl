/**
 * Get message by ID
 */
import { getDatabase } from '../../connection';
import { DatabaseMessage } from '../../schema';

export function getMessageById(id: string): DatabaseMessage | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM messages WHERE id = ?');
  return (stmt.get(id) as DatabaseMessage) || null;
}
