/**
 * Validate conversation data before database operations
 */
import { DatabaseConversation } from '../schema';
import { DatabaseValidationError } from './DatabaseValidationError';

export function validateConversation(conversation: Partial<DatabaseConversation>): void {
  if (conversation.id && typeof conversation.id !== 'string') {
    throw new DatabaseValidationError('Conversation ID must be a string', 'id');
  }

  if (conversation.name !== undefined && typeof conversation.name !== 'string') {
    throw new DatabaseValidationError('Conversation name must be a string', 'name');
  }

  if (conversation.description !== undefined && typeof conversation.description !== 'string') {
    throw new DatabaseValidationError('Conversation description must be a string', 'description');
  }

  if (conversation.created_at !== undefined && typeof conversation.created_at !== 'number') {
    throw new DatabaseValidationError('Conversation created_at must be a number', 'created_at');
  }

  if (conversation.updated_at !== undefined && typeof conversation.updated_at !== 'number') {
    throw new DatabaseValidationError('Conversation updated_at must be a number', 'updated_at');
  }

  if (conversation.is_active !== undefined && typeof conversation.is_active !== 'boolean') {
    throw new DatabaseValidationError('Conversation is_active must be a boolean', 'is_active');
  }
}
