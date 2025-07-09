import type { IpcMainInvokeEvent } from 'electron';
import type { Conversation } from '../../../shared/types';
import { DatabaseError } from '../../../shared/types/errors';
import { UuidSchema } from '../../../shared/types/validation';
import { getConversationById } from '../../database/queries';

export const dbConversationsGetHandler = (
  _event: IpcMainInvokeEvent,
  id: string,
): Conversation | null => {
  try {
    const validatedId = UuidSchema.parse(id);
    const conversation = getConversationById(validatedId);
    if (!conversation) return null;
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
      `Failed to get conversation with ID ${id}`,
      'get',
      'conversations',
      undefined,
      error,
    );
  }
};
