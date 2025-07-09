/**
 * Validate message data before database operations
 */
import { DatabaseMessage } from '../schema';
import { DatabaseValidationError } from './DatabaseValidationError';

export function validateMessage(message: Partial<DatabaseMessage>): void {
  if (message.id && typeof message.id !== 'string') {
    throw new DatabaseValidationError('Message ID must be a string', 'id');
  }

  if (message.conversation_id !== undefined && typeof message.conversation_id !== 'string') {
    throw new DatabaseValidationError(
      'Message conversation_id must be a string',
      'conversation_id',
    );
  }

  if (message.agent_id !== undefined && typeof message.agent_id !== 'string') {
    throw new DatabaseValidationError('Message agent_id must be a string', 'agent_id');
  }

  if (message.content !== undefined && typeof message.content !== 'string') {
    throw new DatabaseValidationError('Message content must be a string', 'content');
  }

  if (message.type !== undefined && typeof message.type !== 'string') {
    throw new DatabaseValidationError('Message type must be a string', 'type');
  }

  if (message.metadata !== undefined && typeof message.metadata !== 'string') {
    throw new DatabaseValidationError('Message metadata must be a string', 'metadata');
  }

  if (message.timestamp !== undefined && typeof message.timestamp !== 'number') {
    throw new DatabaseValidationError('Message timestamp must be a number', 'timestamp');
  }
}
