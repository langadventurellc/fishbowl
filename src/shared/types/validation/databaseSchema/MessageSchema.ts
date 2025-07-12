import { z } from 'zod';

/**
 * Zod schema for Message
 */
export const MessageSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  agentId: z.string().uuid(),
  content: z.string().min(1),
  type: z.string().min(1),
  metadata: z.string(),
  timestamp: z.number(),
});
