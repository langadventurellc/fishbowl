import { z } from 'zod';
import { UuidSchema } from './UuidSchema';
import { UuidArraySchema } from './UuidArraySchema';

/**
 * Zod schema for transaction to transfer messages
 */
export const TransactionTransferMessagesSchema = z.object({
  fromConversationId: UuidSchema,
  toConversationId: UuidSchema,
  messageIds: UuidArraySchema,
});
