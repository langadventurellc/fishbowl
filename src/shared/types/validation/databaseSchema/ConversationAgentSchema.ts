import { z } from 'zod';

/**
 * Zod schema for ConversationAgent relationship
 */
export const ConversationAgentSchema = z.object({
  conversationId: z.string().uuid(),
  agentId: z.string().uuid(),
});
