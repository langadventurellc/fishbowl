import { z } from 'zod';
import { aiProviderSchema } from './aiProviderSchema';

/**
 * Zod schema for retrieving a credential
 */
export const getCredentialSchema = z.object({
  provider: aiProviderSchema,
});
