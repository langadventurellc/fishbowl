import type { IpcMainInvokeEvent } from 'electron';

import type { Message } from '../../../shared/types';
import { DatabaseError } from '../../../shared/types/errors';
import { UuidSchema } from '../../../shared/types/validation';
import { toggleMessageActiveState } from '../../database/queries';

export const dbMessagesToggleActiveStateHandler = async (
  _event: IpcMainInvokeEvent,
  id: string,
): Promise<Message | null> => {
  try {
    // Validate input data with Zod schema
    const validatedId = UuidSchema.parse(id);

    // Execute database operation
    const result = await toggleMessageActiveState(validatedId);

    if (!result) {
      return null;
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
      `Failed to toggle message active state with ID ${id}`,
      'toggle-active-state',
      'messages',
      undefined,
      error,
    );
  }
};
