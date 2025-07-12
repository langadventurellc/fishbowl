import { z } from 'zod';

/**
 * Zod schema for database operation context
 */
export const DatabaseOperationContextSchema = z.object({
  operation: z.string(),
  table: z.string(),
  timestamp: z.number(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
});
