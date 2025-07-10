import type { CreateConversationData } from '../../../shared/types';

export const validateConversationData = (data: CreateConversationData): string[] => {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Conversation name is required');
  }
  if (data.name && data.name.length > 200) {
    errors.push('Conversation name cannot exceed 200 characters');
  }

  if (data.description && data.description.length > 1000) {
    errors.push('Conversation description cannot exceed 1000 characters');
  }

  return errors;
};
