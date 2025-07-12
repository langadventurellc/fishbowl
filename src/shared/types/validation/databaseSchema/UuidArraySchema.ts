import { z } from 'zod';
import { UuidSchema } from './UuidSchema';

/**
 * Zod schema for array of UUIDs
 */
export const UuidArraySchema = z.array(UuidSchema).min(1, 'At least one UUID is required');
