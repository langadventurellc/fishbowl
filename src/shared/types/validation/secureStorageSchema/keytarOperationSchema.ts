import { z } from 'zod';
import { secureStorageServiceSchema } from './secureStorageServiceSchema';

/**
 * Zod schema for keytar operations
 */
export const keytarOperationSchema = z.object({
  service: secureStorageServiceSchema,
  account: z.string().min(1),
  password: z.string().optional(),
});
