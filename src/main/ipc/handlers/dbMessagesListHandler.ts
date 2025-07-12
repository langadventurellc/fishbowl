import type { IpcMainInvokeEvent } from 'electron';
import type { Message, DatabaseFilter } from '../../../shared/types';
import { DatabaseError } from '../../../shared/types/errors';
import { UuidSchema } from '../../../shared/types/validation';
import { getMessagesByConversationId } from '../../database/queries';

export const dbMessagesListHandler = (
  _event: IpcMainInvokeEvent,
  conversationId: string,
  _filter?: DatabaseFilter,
): Message[] => {
  try {
    const validatedConversationId = UuidSchema.parse(conversationId);
    const messages = getMessagesByConversationId(validatedConversationId);
    return messages.map(message => ({
      id: message.id,
      conversationId: message.conversation_id,
      agentId: message.agent_id,
      isActive: message.is_active,
      content: message.content,
      type: message.type,
      metadata: message.metadata,
      timestamp: message.timestamp,
    }));
  } catch (error) {
    throw new DatabaseError(
      `Failed to list messages for conversation ${conversationId}`,
      'list',
      'messages',
      undefined,
      error,
    );
  }
};
