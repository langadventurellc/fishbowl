import { z } from 'zod';
import { UuidSchema } from './UuidSchema';
import { SanitizedContentSchema } from './SanitizedContentSchema';

/**
 * Enhanced message schema for creating with sanitization
 */
export const SanitizedCreateMessageSchema = z.object({
  conversationId: UuidSchema,
  agentId: UuidSchema,
  content: SanitizedContentSchema,
  type: z.string().min(1, 'Message type cannot be empty'),
  isActive: z.boolean().default(true),
  metadata: z
    .string()
    .optional()
    .default('{}')
    .refine(val => {
      try {
        JSON.parse(val);
        return true;
      } catch {
        return false;
      }
    }, 'Metadata must be valid JSON'),
});
