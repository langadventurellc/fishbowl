import { z } from 'zod';

/**
 * Zod schema for creating a new Conversation
 */
export const CreateConversationSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(''),
  isActive: z.boolean().default(true),
});
