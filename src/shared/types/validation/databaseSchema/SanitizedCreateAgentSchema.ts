import { z } from 'zod';
import { SanitizedNameSchema } from './SanitizedNameSchema';
import { SanitizedContentSchema } from './SanitizedContentSchema';

/**
 * Enhanced agent schema for creating with sanitization
 */
export const SanitizedCreateAgentSchema = z.object({
  name: SanitizedNameSchema,
  role: SanitizedNameSchema,
  personality: SanitizedContentSchema,
  isActive: z.boolean().default(true),
});
