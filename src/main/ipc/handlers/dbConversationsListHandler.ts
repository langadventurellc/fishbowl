import type { IpcMainInvokeEvent } from 'electron';
import type { Conversation, DatabaseFilter } from '../../../shared/types';
import { DatabaseError } from '../../../shared/types/errors';
import { getActiveConversations } from '../../database/queries';

export const dbConversationsListHandler = (
  _event: IpcMainInvokeEvent,
  _filter?: DatabaseFilter,
): Conversation[] => {
  try {
    const conversations = getActiveConversations();
    return conversations.map(conversation => ({
      id: conversation.id,
      name: conversation.name,
      description: conversation.description,
      createdAt: conversation.created_at,
      updatedAt: conversation.updated_at,
      isActive: conversation.is_active,
    }));
  } catch (error) {
    throw new DatabaseError(
      'Failed to list conversations',
      'list',
      'conversations',
      undefined,
      error,
    );
  }
};
