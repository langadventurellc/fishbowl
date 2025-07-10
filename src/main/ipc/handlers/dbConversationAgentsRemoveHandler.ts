import type { IpcMainInvokeEvent } from 'electron';
import { DatabaseError } from '../../../shared/types/errors';
import { UuidSchema } from '../../../shared/types/validation';

export const dbConversationAgentsRemoveHandler = (
  _event: IpcMainInvokeEvent,
  conversationId: string,
  agentId: string,
): void => {
  try {
    UuidSchema.parse(conversationId);
    UuidSchema.parse(agentId);

    // Note: This requires implementing the actual database operation
    // For now, we'll throw an error indicating it's not yet implemented
    throw new DatabaseError(
      'Remove conversation-agent relationship not yet implemented',
      'remove',
      'conversation_agents',
      undefined,
      new Error('Not implemented'),
    );
  } catch (error) {
    throw new DatabaseError(
      `Failed to remove agent ${agentId} from conversation ${conversationId}`,
      'remove',
      'conversation_agents',
      undefined,
      error,
    );
  }
};
