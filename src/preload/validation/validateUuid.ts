import { z } from 'zod';

/**
 * Validate UUID format
 */
const uuidSchema = z.string().uuid();

export const validateUuid = (id: string): boolean => {
  try {
    uuidSchema.parse(id);
    return true;
  } catch {
    return false;
  }
};
