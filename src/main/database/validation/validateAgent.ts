/**
 * Validate agent data before database operations
 */
import { DatabaseAgent } from '../schema';
import { DatabaseValidationError } from './DatabaseValidationError';

export function validateAgent(agent: Partial<DatabaseAgent>): void {
  if (agent.id && typeof agent.id !== 'string') {
    throw new DatabaseValidationError('Agent ID must be a string', 'id');
  }

  if (agent.name !== undefined && typeof agent.name !== 'string') {
    throw new DatabaseValidationError('Agent name must be a string', 'name');
  }

  if (agent.role !== undefined && typeof agent.role !== 'string') {
    throw new DatabaseValidationError('Agent role must be a string', 'role');
  }

  if (agent.personality !== undefined && typeof agent.personality !== 'string') {
    throw new DatabaseValidationError('Agent personality must be a string', 'personality');
  }

  if (agent.is_active !== undefined && typeof agent.is_active !== 'boolean') {
    throw new DatabaseValidationError('Agent is_active must be a boolean', 'is_active');
  }

  if (agent.created_at !== undefined && typeof agent.created_at !== 'number') {
    throw new DatabaseValidationError('Agent created_at must be a number', 'created_at');
  }

  if (agent.updated_at !== undefined && typeof agent.updated_at !== 'number') {
    throw new DatabaseValidationError('Agent updated_at must be a number', 'updated_at');
  }
}
