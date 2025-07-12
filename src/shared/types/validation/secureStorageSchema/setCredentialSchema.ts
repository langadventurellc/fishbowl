import { z } from 'zod';
import { aiProviderSchema } from './aiProviderSchema';

/**
 * Zod schema for storing a credential
 */
export const setCredentialSchema = z.object({
  provider: aiProviderSchema,
  apiKey: z.string().min(1),
  metadata: z.record(z.any()).optional(),
});
