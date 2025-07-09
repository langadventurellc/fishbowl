/**
 * Create multiple messages and update conversation timestamp atomically
 */
import { transactionManager } from './transactionManagerInstance';
import { DatabaseMessage } from '../schema';

export function createMessagesAndUpdateConversation(
  conversationId: string,
  messages: Omit<DatabaseMessage, 'timestamp'>[],
): DatabaseMessage[] {
  return transactionManager.executeTransaction(db => {
    const now = Date.now();

    // Insert messages
    const insertMessage = db.prepare(`
      INSERT INTO messages (id, conversation_id, agent_id, content, type, metadata, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const results: DatabaseMessage[] = [];
    for (const message of messages) {
      const messageData = {
        ...message,
        timestamp: now,
      };

      insertMessage.run(
        messageData.id,
        messageData.conversation_id,
        messageData.agent_id,
        messageData.content,
        messageData.type,
        messageData.metadata,
        messageData.timestamp,
      );

      results.push(messageData);
    }

    // Update conversation timestamp
    const updateConversation = db.prepare(`
      UPDATE conversations SET updated_at = ? WHERE id = ?
    `);
    updateConversation.run(now, conversationId);

    return results;
  });
}
