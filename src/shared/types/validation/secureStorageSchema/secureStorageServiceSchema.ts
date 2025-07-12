import { z } from 'zod';

/**
 * Zod schema for secure storage service names
 */
export const secureStorageServiceSchema = z.enum(['fishbowl-ai-keys', 'fishbowl-config']);
