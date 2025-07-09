/**
 * Get conversation by ID
 */
import { getDatabase } from '../../connection';
import { DatabaseConversation } from '../../schema';

export function getConversationById(id: string): DatabaseConversation | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM conversations WHERE id = ?');
  return (stmt.get(id) as DatabaseConversation) || null;
}
