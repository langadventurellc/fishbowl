import { z } from 'zod';
import { aiProviderSchema } from './aiProviderSchema';

/**
 * Zod schema for deleting a credential
 */
export const deleteCredentialSchema = z.object({
  provider: aiProviderSchema,
});
