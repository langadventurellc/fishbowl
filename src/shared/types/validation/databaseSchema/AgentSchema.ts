import { z } from 'zod';

/**
 * Zod schema for Agent
 */
export const AgentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  role: z.string().min(1),
  personality: z.string().min(1),
  isActive: z.boolean(),
  createdAt: z.number(),
  updatedAt: z.number(),
});
