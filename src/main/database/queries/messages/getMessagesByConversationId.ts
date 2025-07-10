/**
 * Get messages by conversation ID
 */
import { getDatabase } from '../../connection';
import { DatabaseMessage } from '../../schema';

export function getMessagesByConversationId(
  conversationId: string,
  limit = 100,
  offset = 0,
): DatabaseMessage[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM messages 
    WHERE conversation_id = ? 
    ORDER BY timestamp DESC 
    LIMIT ? OFFSET ?
  `);
  return stmt.all(conversationId, limit, offset) as DatabaseMessage[];
}
