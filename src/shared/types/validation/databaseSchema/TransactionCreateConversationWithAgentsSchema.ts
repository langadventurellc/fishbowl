import { z } from 'zod';
import { CreateConversationSchema } from './CreateConversationSchema';
import { UuidArraySchema } from './UuidArraySchema';

/**
 * Zod schema for transaction to create conversation with agents
 */
export const TransactionCreateConversationWithAgentsSchema = z.object({
  conversationData: CreateConversationSchema,
  agentIds: UuidArraySchema,
});
