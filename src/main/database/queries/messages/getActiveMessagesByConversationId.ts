/**
 * Get active messages by conversation ID
 */
import { getDatabase } from '../../connection';
import { DatabaseMessage } from '../../schema';
import { UuidSchema } from '../../../../shared/types/validation';

export function getActiveMessagesByConversationId(
  conversationId: string,
  limit = 100,
  offset = 0,
): DatabaseMessage[] {
  const validatedConversationId = UuidSchema.parse(conversationId);
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM messages 
    WHERE conversation_id = ? AND is_active = 1 
    ORDER BY timestamp DESC 
    LIMIT ? OFFSET ?
  `);
  return stmt.all(validatedConversationId, limit, offset) as DatabaseMessage[];
}
