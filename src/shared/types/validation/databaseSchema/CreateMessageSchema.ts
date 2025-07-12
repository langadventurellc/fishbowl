import { z } from 'zod';

/**
 * Zod schema for creating a new Message
 */
export const CreateMessageSchema = z.object({
  conversationId: z.string().uuid(),
  agentId: z.string().uuid(),
  content: z.string().min(1),
  type: z.string().min(1),
  isActive: z.boolean().default(true),
  metadata: z.string().optional().default('{}'),
});
