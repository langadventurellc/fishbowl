import type { IpcMainInvokeEvent } from 'electron';
import { DatabaseError } from '../../../shared/types/errors';
import { UuidSchema } from '../../../shared/types/validation';
import { deleteMessage } from '../../database/queries';

export const dbMessagesDeleteHandler = (_event: IpcMainInvokeEvent, id: string): void => {
  try {
    const validatedId = UuidSchema.parse(id);
    deleteMessage(validatedId);
  } catch (error) {
    throw new DatabaseError(
      `Failed to delete message with ID ${id}`,
      'delete',
      'messages',
      undefined,
      error,
    );
  }
};
