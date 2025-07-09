import type { IpcMainInvokeEvent } from 'electron';
import type { Agent, DatabaseFilter } from '../../../shared/types';
import { DatabaseError } from '../../../shared/types/errors';
import { getActiveAgents } from '../../database/queries';

export const dbAgentsListHandler = (
  _event: IpcMainInvokeEvent,
  _filter?: DatabaseFilter,
): Agent[] => {
  try {
    const agents = getActiveAgents();
    return agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      role: agent.role,
      personality: agent.personality,
      isActive: agent.is_active,
      createdAt: agent.created_at,
      updatedAt: agent.updated_at,
    }));
  } catch (error) {
    throw new DatabaseError('Failed to list agents', 'list', 'agents', undefined, error);
  }
};
