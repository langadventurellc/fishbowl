import type { IpcMainInvokeEvent } from 'electron';
import { DatabaseError } from '../../../shared/types/errors';
import { UuidSchema } from '../../../shared/types/validation';
import { deleteAgent } from '../../database/queries';

export const dbAgentsDeleteHandler = (_event: IpcMainInvokeEvent, id: string): void => {
  try {
    const validatedId = UuidSchema.parse(id);
    deleteAgent(validatedId);
  } catch (error) {
    throw new DatabaseError(
      `Failed to delete agent with ID ${id}`,
      'delete',
      'agents',
      undefined,
      error,
    );
  }
};
