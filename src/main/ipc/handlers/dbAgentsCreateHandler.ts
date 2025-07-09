import type { IpcMainInvokeEvent } from 'electron';
import type { Agent, CreateAgentData } from '../../../shared/types';
import { SanitizedCreateAgentSchema } from '../../../shared/types/validation';
import { createAgent } from '../../database/queries';
import { DatabaseErrorHandler } from '../error-handler';
import { v4 as uuidv4 } from 'uuid';

export const dbAgentsCreateHandler = async (
  _event: IpcMainInvokeEvent,
  agentData: CreateAgentData,
): Promise<Agent> => {
  const context = {
    operation: 'create',
    table: 'agents',
    timestamp: Date.now(),
  };

  try {
    return await DatabaseErrorHandler.executeWithRetry(() => {
      const validatedData = SanitizedCreateAgentSchema.parse(agentData);
      const agent = createAgent({
        id: uuidv4(),
        name: validatedData.name,
        role: validatedData.role,
        personality: validatedData.personality,
        is_active: validatedData.isActive,
      });
      return {
        id: agent.id,
        name: agent.name,
        role: agent.role,
        personality: agent.personality,
        isActive: agent.is_active,
        createdAt: agent.created_at,
        updatedAt: agent.updated_at,
      };
    }, context);
  } catch (error) {
    DatabaseErrorHandler.handleDatabaseError(error, context);
  }
};
