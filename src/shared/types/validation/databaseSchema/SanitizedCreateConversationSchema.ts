import { z } from 'zod';
import { SanitizedNameSchema } from './SanitizedNameSchema';

/**
 * Enhanced conversation schema for creating with sanitization
 */
export const SanitizedCreateConversationSchema = z.object({
  name: SanitizedNameSchema,
  description: z
    .string()
    .optional()
    .default('')
    .transform(val => val.trim()),
  isActive: z.boolean().default(true),
});
