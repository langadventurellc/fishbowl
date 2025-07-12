import { z } from 'zod';

/**
 * Zod schema for database query filters
 */
export const DatabaseFilterSchema = z.object({
  limit: z.number().min(1).max(1000).optional(),
  offset: z.number().min(0).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  where: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
});
