import { z } from 'zod';
import { aiProviderSchema } from './aiProviderSchema';

/**
 * Zod schema for credential information (without API key)
 */
export const credentialInfoSchema = z.object({
  provider: aiProviderSchema,
  hasApiKey: z.boolean(),
  lastUpdated: z.number(),
  metadata: z.record(z.any()).optional(),
});
