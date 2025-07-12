import { z } from 'zod';
import { UuidSchema } from './UuidSchema';
import { SanitizedNameSchema } from './SanitizedNameSchema';
import { SanitizedContentSchema } from './SanitizedContentSchema';

/**
 * Enhanced agent schema for updating with sanitization
 */
export const SanitizedUpdateAgentSchema = z.object({
  id: UuidSchema,
  name: SanitizedNameSchema.optional(),
  role: SanitizedNameSchema.optional(),
  personality: SanitizedContentSchema.optional(),
  isActive: z.boolean().optional(),
});
