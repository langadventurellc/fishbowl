import type { IpcMainInvokeEvent } from 'electron';
import type { Agent, UpdateAgentData } from '../../../shared/types';
import { DatabaseError } from '../../../shared/types/errors';
import { SanitizedUpdateAgentSchema } from '../../../shared/types/validation';
import { updateAgent } from '../../database/queries';

export const dbAgentsUpdateHandler = (
  _event: IpcMainInvokeEvent,
  id: string,
  updates: UpdateAgentData,
): Agent => {
  try {
    const validatedUpdates = SanitizedUpdateAgentSchema.parse({ id, ...updates });
    const agent = updateAgent(validatedUpdates.id, {
      name: validatedUpdates.name,
      role: validatedUpdates.role,
      personality: validatedUpdates.personality,
      is_active: validatedUpdates.isActive,
    });
    if (!agent) {
      throw new DatabaseError(
        `Agent with ID ${id} not found`,
        'update',
        'agents',
        undefined,
        new Error('Agent not found'),
      );
    }
    return {
      id: agent.id,
      name: agent.name,
      role: agent.role,
      personality: agent.personality,
      isActive: agent.is_active,
      createdAt: agent.created_at,
      updatedAt: agent.updated_at,
    };
  } catch (error) {
    throw new DatabaseError(
      `Failed to update agent with ID ${id}`,
      'update',
      'agents',
      undefined,
      error,
    );
  }
};
