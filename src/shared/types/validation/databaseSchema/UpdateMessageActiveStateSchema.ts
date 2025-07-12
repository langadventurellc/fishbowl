import { z } from 'zod';

/**
 * Zod schema for updating a Message active state
 */
export const UpdateMessageActiveStateSchema = z.object({
  id: z.string().uuid(),
  isActive: z.boolean(),
});
