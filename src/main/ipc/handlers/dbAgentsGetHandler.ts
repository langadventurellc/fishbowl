import type { IpcMainInvokeEvent } from 'electron';
import type { Agent } from '../../../shared/types';
import { DatabaseError } from '../../../shared/types/errors';
import { UuidSchema } from '../../../shared/types/validation';
import { getAgentById } from '../../database/queries';

export const dbAgentsGetHandler = (_event: IpcMainInvokeEvent, id: string): Agent | null => {
  try {
    const validatedId = UuidSchema.parse(id);
    const agent = getAgentById(validatedId);
    if (!agent) return null;
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
    throw new DatabaseError(`Failed to get agent with ID ${id}`, 'get', 'agents', undefined, error);
  }
};
