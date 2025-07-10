import type { CreateAgentData } from '../../../shared/types';

/**
 * Data validation utilities
 */

export const validateAgentData = (data: CreateAgentData): string[] => {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Agent name is required');
  }
  if (data.name && data.name.length > 100) {
    errors.push('Agent name cannot exceed 100 characters');
  }

  if (!data.role || data.role.trim().length === 0) {
    errors.push('Agent role is required');
  }
  if (data.role && data.role.length > 50) {
    errors.push('Agent role cannot exceed 50 characters');
  }

  if (!data.personality || data.personality.trim().length === 0) {
    errors.push('Agent personality is required');
  }
  if (data.personality && data.personality.length > 500) {
    errors.push('Agent personality cannot exceed 500 characters');
  }

  return errors;
};
