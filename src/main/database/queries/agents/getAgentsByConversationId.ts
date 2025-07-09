/**
 * Get agents by conversation ID
 */
import { getDatabase } from '../../connection';
import { DatabaseAgent } from '../../schema';

export function getAgentsByConversationId(conversationId: string): DatabaseAgent[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT a.* FROM agents a
    JOIN conversation_agents ca ON a.id = ca.agent_id
    WHERE ca.conversation_id = ? AND a.is_active = 1
    ORDER BY a.name ASC
  `);
  return stmt.all(conversationId) as DatabaseAgent[];
}
