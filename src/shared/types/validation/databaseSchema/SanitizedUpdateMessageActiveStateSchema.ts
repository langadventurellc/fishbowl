import { z } from 'zod';
import { UuidSchema } from './UuidSchema';

/**
 * Enhanced update message active state schema with sanitization
 */
export const SanitizedUpdateMessageActiveStateSchema = z.object({
  id: UuidSchema,
  isActive: z.boolean(),
});
