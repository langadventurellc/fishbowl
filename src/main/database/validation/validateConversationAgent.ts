/**
 * Validate conversation-agent relationship data
 */
import { DatabaseConversationAgent } from '../schema';
import { DatabaseValidationError } from './DatabaseValidationError';

export function validateConversationAgent(relation: Partial<DatabaseConversationAgent>): void {
  if (relation.conversation_id && typeof relation.conversation_id !== 'string') {
    throw new DatabaseValidationError(
      'ConversationAgent conversation_id must be a string',
      'conversation_id',
    );
  }

  if (relation.agent_id && typeof relation.agent_id !== 'string') {
    throw new DatabaseValidationError('ConversationAgent agent_id must be a string', 'agent_id');
  }
}
