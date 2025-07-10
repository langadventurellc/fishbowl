import type { IpcMainInvokeEvent } from 'electron';
import type { ConversationAgent } from '../../../shared/types';
import { DatabaseError } from '../../../shared/types/errors';
import { UuidSchema } from '../../../shared/types/validation';
import { getAgentsByConversationId } from '../../database/queries';

export const dbConversationAgentsListHandler = (
  _event: IpcMainInvokeEvent,
  conversationId: string,
): ConversationAgent[] => {
  try {
    const validatedConversationId = UuidSchema.parse(conversationId);
    const agents = getAgentsByConversationId(validatedConversationId);
    return agents.map(agent => ({
      conversationId: validatedConversationId,
      agentId: agent.id,
    }));
  } catch (error) {
    throw new DatabaseError(
      `Failed to list agents for conversation ${conversationId}`,
      'list',
      'conversation_agents',
      undefined,
      error,
    );
  }
};
