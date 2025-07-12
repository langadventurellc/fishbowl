import { z } from 'zod';

/**
 * Zod schema for sanitizing name strings
 */
export const SanitizedNameSchema = z
  .string()
  .min(1, 'Name cannot be empty')
  .max(255, 'Name too long')
  .transform(val => val.trim())
  .refine(val => val.length > 0, 'Name cannot be empty after trimming')
  .refine(val => !val.includes('\n'), 'Name cannot contain newlines');
