import { z } from 'zod';
import { UuidSchema } from './UuidSchema';
import { SanitizedNameSchema } from './SanitizedNameSchema';

/**
 * Enhanced conversation schema for updating with sanitization
 */
export const SanitizedUpdateConversationSchema = z.object({
  id: UuidSchema,
  name: SanitizedNameSchema.optional(),
  description: z
    .string()
    .optional()
    .transform(val => val?.trim()),
  isActive: z.boolean().optional(),
});
