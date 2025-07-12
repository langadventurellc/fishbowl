import type { IpcMainInvokeEvent } from 'electron';
import type { Message } from '../../../shared/types';
import { DatabaseError } from '../../../shared/types/errors';
import { UuidSchema } from '../../../shared/types/validation';
import { getMessageById } from '../../database/queries';

export const dbMessagesGetHandler = (_event: IpcMainInvokeEvent, id: string): Message | null => {
  try {
    const validatedId = UuidSchema.parse(id);
    const message = getMessageById(validatedId);
    if (!message) return null;
    return {
      id: message.id,
      conversationId: message.conversation_id,
      agentId: message.agent_id,
      isActive: message.is_active,
      content: message.content,
      type: message.type,
      metadata: message.metadata,
      timestamp: message.timestamp,
    };
  } catch (error) {
    throw new DatabaseError(
      `Failed to get message with ID ${id}`,
      'get',
      'messages',
      undefined,
      error,
    );
  }
};
