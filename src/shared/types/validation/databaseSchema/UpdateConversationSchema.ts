import { z } from 'zod';

/**
 * Zod schema for updating a Conversation
 */
export const UpdateConversationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});
