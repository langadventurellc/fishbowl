/**
 * Create a new conversation
 */
import { getDatabase } from '../../connection';
import { DatabaseConversation } from '../../schema';

export function createConversation(
  conversation: Omit<DatabaseConversation, 'created_at' | 'updated_at'>,
): DatabaseConversation {
  const db = getDatabase();
  const now = Date.now();

  const insertConversation = db.prepare(`
    INSERT INTO conversations (id, name, description, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const conversationData = {
    ...conversation,
    created_at: now,
    updated_at: now,
  };

  insertConversation.run(
    conversationData.id,
    conversationData.name,
    conversationData.description,
    conversationData.is_active,
    conversationData.created_at,
    conversationData.updated_at,
  );

  return conversationData;
}
