import { z } from 'zod';

/**
 * Zod schema for error recovery options
 */
export const ErrorRecoveryOptionsSchema = z.object({
  retryCount: z.number().min(0).max(5).default(0),
  timeout: z.number().min(100).max(30000).default(5000),
  fallbackMode: z.boolean().default(false),
});
