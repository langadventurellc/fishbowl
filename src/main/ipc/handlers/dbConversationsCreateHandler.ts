import type { IpcMainInvokeEvent } from 'electron';
import type { Conversation, CreateConversationData } from '../../../shared/types';
import { DatabaseError } from '../../../shared/types/errors';
import { SanitizedCreateConversationSchema } from '../../../shared/types/validation';
import { createConversation } from '../../database/queries';
import { v4 as uuidv4 } from 'uuid';

export const dbConversationsCreateHandler = (
  _event: IpcMainInvokeEvent,
  conversationData: CreateConversationData,
): Conversation => {
  try {
    const validatedData = SanitizedCreateConversationSchema.parse(conversationData);
    const conversation = createConversation({
      id: uuidv4(),
      name: validatedData.name,
      description: validatedData.description,
      is_active: validatedData.isActive,
    });
    return {
      id: conversation.id,
      name: conversation.name,
      description: conversation.description,
      createdAt: conversation.created_at,
      updatedAt: conversation.updated_at,
      isActive: conversation.is_active,
    };
  } catch (error) {
    throw new DatabaseError(
      'Failed to create conversation',
      'create',
      'conversations',
      undefined,
      error,
    );
  }
};
