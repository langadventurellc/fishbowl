import type { IpcMainInvokeEvent } from 'electron';

import type { Message, UpdateMessageActiveStateData } from '../../../shared/types';
import { DatabaseError } from '../../../shared/types/errors';
import { SanitizedUpdateMessageActiveStateSchema } from '../../../shared/types/validation';
import { updateMessageActiveState } from '../../database/queries';

export const dbMessagesUpdateActiveStateHandler = async (
  _event: IpcMainInvokeEvent,
  id: string,
  updates: UpdateMessageActiveStateData,
): Promise<Message | null> => {
  try {
    // Validate input data with Zod schema
    const validatedData = SanitizedUpdateMessageActiveStateSchema.parse({ id, ...updates });

    // Execute database operation
    const result = await updateMessageActiveState(validatedData.id, validatedData.isActive);

    if (!result) {
      throw new DatabaseError(
        `Message with ID ${id} not found`,
        'update',
        'messages',
        undefined,
        new Error('Message not found'),
      );
    }

    // Transform database format to API format
    return {
      id: result.id,
      conversationId: result.conversation_id,
      agentId: result.agent_id,
      isActive: result.is_active,
      content: result.content,
      type: result.type,
      metadata: result.metadata,
      timestamp: result.timestamp,
    };
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError(
      `Failed to update message active state with ID ${id}`,
      'update',
      'messages',
      undefined,
      error,
    );
  }
};
