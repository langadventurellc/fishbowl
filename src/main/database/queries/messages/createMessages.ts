/**
 * Batch insert messages
 */
import { getDatabase } from '../../connection';
import { DatabaseMessage } from '../../schema';

export function createMessages(messages: Omit<DatabaseMessage, 'timestamp'>[]): DatabaseMessage[] {
  const db = getDatabase();
  const now = Date.now();

  const insertMessage = db.prepare(`
    INSERT INTO messages (id, conversation_id, agent_id, content, type, metadata, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const results: DatabaseMessage[] = [];

  db.transaction(() => {
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
  })();

  return results;
}
