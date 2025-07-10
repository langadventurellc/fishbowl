import type { IpcMainInvokeEvent } from 'electron';
import { DatabaseError } from '../../../shared/types/errors';
import { UuidSchema } from '../../../shared/types/validation';
import { deleteConversation } from '../../database/queries';

export const dbConversationsDeleteHandler = (_event: IpcMainInvokeEvent, id: string): void => {
  try {
    const validatedId = UuidSchema.parse(id);
    deleteConversation(validatedId);
  } catch (error) {
    throw new DatabaseError(
      `Failed to delete conversation with ID ${id}`,
      'delete',
      'conversations',
      undefined,
      error,
    );
  }
};
