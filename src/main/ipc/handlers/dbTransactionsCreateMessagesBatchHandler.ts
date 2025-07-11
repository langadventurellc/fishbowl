import type { IpcMainInvokeEvent } from 'electron';
import type { Message, CreateMessageData } from '../../../shared/types';
import { DatabaseError } from '../../../shared/types/errors';
import { SanitizedCreateMessageSchema } from '../../../shared/types/validation';
import { transactionManager } from '../../database/transactions';
import { v4 as uuidv4 } from 'uuid';

export const dbTransactionsCreateMessagesBatchHandler = (
  _event: IpcMainInvokeEvent,
  messages: CreateMessageData[],
): Message[] => {
  try {
    const validatedMessages = messages.map(msg => SanitizedCreateMessageSchema.parse(msg));

    return transactionManager.executeTransaction(db => {
      const insertMessage = db.prepare(`
        INSERT INTO messages (id, conversation_id, agent_id, is_active, content, type, metadata, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const createdMessages: Message[] = [];
      const now = Date.now();

      for (const msgData of validatedMessages) {
        const messageRecord = {
          id: uuidv4(),
          conversation_id: msgData.conversationId,
          agent_id: msgData.agentId,
          is_active: msgData.isActive,
          content: msgData.content,
          type: msgData.type,
          metadata: msgData.metadata ?? '{}',
          timestamp: now,
        };

        insertMessage.run(
          messageRecord.id,
          messageRecord.conversation_id,
          messageRecord.agent_id,
          messageRecord.is_active,
          messageRecord.content,
          messageRecord.type,
          messageRecord.metadata,
          messageRecord.timestamp,
        );

        createdMessages.push({
          id: messageRecord.id,
          conversationId: messageRecord.conversation_id,
          agentId: messageRecord.agent_id,
          isActive: messageRecord.is_active,
          content: messageRecord.content,
          type: messageRecord.type,
          metadata: messageRecord.metadata,
          timestamp: messageRecord.timestamp,
        });
      }

      // Update conversation timestamp
      const updateConversation = db.prepare(`
        UPDATE conversations SET updated_at = ? WHERE id = ?
      `);

      if (validatedMessages.length > 0) {
        updateConversation.run(now, validatedMessages[0].conversationId);
      }

      return createdMessages;
    });
  } catch (error) {
    throw new DatabaseError(
      'Failed to create messages batch',
      'create-batch',
      'messages',
      undefined,
      error,
    );
  }
};
