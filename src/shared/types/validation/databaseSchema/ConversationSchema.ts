import { z } from 'zod';

/**
 * Zod schema for Conversation
 */
export const ConversationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  isActive: z.boolean(),
});
