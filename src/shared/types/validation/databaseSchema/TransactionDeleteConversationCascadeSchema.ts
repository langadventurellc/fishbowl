import { z } from 'zod';
import { UuidSchema } from './UuidSchema';

/**
 * Zod schema for transaction to delete conversation cascade
 */
export const TransactionDeleteConversationCascadeSchema = z.object({
  conversationId: UuidSchema,
});
