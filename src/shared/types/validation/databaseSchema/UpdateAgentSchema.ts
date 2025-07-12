import { z } from 'zod';

/**
 * Zod schema for updating an Agent
 */
export const UpdateAgentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  personality: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});
