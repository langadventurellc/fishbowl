import { z } from 'zod';

/**
 * Zod schema for creating a new Agent
 */
export const CreateAgentSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  personality: z.string().min(1),
  isActive: z.boolean().default(true),
});
