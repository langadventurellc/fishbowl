import type { IpcMainInvokeEvent } from 'electron';
import type { Message, CreateMessageData } from '../../../shared/types';
import { DatabaseError } from '../../../shared/types/errors';
import { SanitizedCreateMessageSchema } from '../../../shared/types/validation';
import { createMessage } from '../../database/queries';
import { v4 as uuidv4 } from 'uuid';

export const dbMessagesCreateHandler = (
  _event: IpcMainInvokeEvent,
  messageData: CreateMessageData,
): Message => {
  try {
    const validatedData = SanitizedCreateMessageSchema.parse(messageData);
    const message = createMessage({
      id: uuidv4(),
      conversation_id: validatedData.conversationId,
      agent_id: validatedData.agentId,
      is_active: validatedData.isActive,
      content: validatedData.content,
      type: validatedData.type,
      metadata: validatedData.metadata,
    });
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
    throw new DatabaseError('Failed to create message', 'create', 'messages', undefined, error);
  }
};
