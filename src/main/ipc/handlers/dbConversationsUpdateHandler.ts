import type { IpcMainInvokeEvent } from 'electron';
import type { Conversation, UpdateConversationData } from '../../../shared/types';
import { DatabaseError } from '../../../shared/types/errors';
import { SanitizedUpdateConversationSchema } from '../../../shared/types/validation';
import { updateConversation } from '../../database/queries';

export const dbConversationsUpdateHandler = (
  _event: IpcMainInvokeEvent,
  id: string,
  updates: UpdateConversationData,
): Conversation => {
  try {
    const validatedUpdates = SanitizedUpdateConversationSchema.parse({ id, ...updates });
    const conversation = updateConversation(validatedUpdates.id, {
      name: validatedUpdates.name,
      description: validatedUpdates.description,
      is_active: validatedUpdates.isActive,
    });
    if (!conversation) {
      throw new DatabaseError(
        `Conversation with ID ${id} not found`,
        'update',
        'conversations',
        undefined,
        new Error('Conversation not found'),
      );
    }
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
      `Failed to update conversation with ID ${id}`,
      'update',
      'conversations',
      undefined,
      error,
    );
  }
};
