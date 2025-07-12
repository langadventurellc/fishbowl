import { z } from 'zod';

/**
 * Zod schema for UUID validation
 */
export const UuidSchema = z.string().uuid('Invalid UUID format');
