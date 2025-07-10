/**
 * Get all active conversations
 */
import { getDatabase } from '../../connection';
import { DatabaseConversation } from '../../schema';

export function getActiveConversations(limit = 100): DatabaseConversation[] {
  const db = getDatabase();
  const stmt = db.prepare(
    'SELECT * FROM conversations WHERE is_active = 1 ORDER BY updated_at DESC LIMIT ?',
  );
  return stmt.all(limit) as DatabaseConversation[];
}
