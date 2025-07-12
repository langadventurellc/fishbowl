import { z } from 'zod';

/**
 * Zod schema for sanitizing content strings
 */
export const SanitizedContentSchema = z
  .string()
  .min(1, 'Content cannot be empty')
  .max(10000, 'Content too long')
  .transform(val => val.trim())
  .refine(val => val.length > 0, 'Content cannot be empty after trimming');
