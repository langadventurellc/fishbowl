/**
 * Create a new message
 */
import { getDatabase } from '../../connection';
import { DatabaseMessage } from '../../schema';
import { UuidSchema } from '../../../../shared/types/validation';

export function createMessage(message: Omit<DatabaseMessage, 'timestamp'>): DatabaseMessage {
  // Validate all UUID fields
  const validatedId = UuidSchema.parse(message.id);
  const validatedConversationId = UuidSchema.parse(message.conversation_id);
  const validatedAgentId = UuidSchema.parse(message.agent_id);

  const db = getDatabase();
  const now = Date.now();

  const insertMessage = db.prepare(`
    INSERT INTO messages (id, conversation_id, agent_id, content, type, metadata, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const messageData = {
    ...message,
    id: validatedId,
    conversation_id: validatedConversationId,
    agent_id: validatedAgentId,
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

  return messageData;
}
