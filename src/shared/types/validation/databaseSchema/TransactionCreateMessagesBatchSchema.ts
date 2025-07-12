import { z } from 'zod';
import { CreateMessageSchema } from './CreateMessageSchema';

/**
 * Zod schema for transaction to create messages batch
 */
export const TransactionCreateMessagesBatchSchema = z.object({
  messages: z.array(CreateMessageSchema).min(1, 'At least one message is required'),
});
