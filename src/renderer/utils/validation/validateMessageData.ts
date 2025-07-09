import type { CreateMessageData } from '../../../shared/types';

export const validateMessageData = (data: CreateMessageData): string[] => {
  const errors: string[] = [];

  if (!data.conversationId || data.conversationId.trim().length === 0) {
    errors.push('Conversation ID is required');
  }

  if (!data.agentId || data.agentId.trim().length === 0) {
    errors.push('Agent ID is required');
  }

  if (!data.content || data.content.trim().length === 0) {
    errors.push('Message content is required');
  }
  if (data.content && data.content.length > 10000) {
    errors.push('Message content cannot exceed 10,000 characters');
  }

  if (!data.type || data.type.trim().length === 0) {
    errors.push('Message type is required');
  }

  return errors;
};
