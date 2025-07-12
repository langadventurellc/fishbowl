import { z } from 'zod';

/**
 * Zod schema for credential operations
 */
export const credentialOperationSchema = z.enum(['get', 'set', 'delete', 'list']);
