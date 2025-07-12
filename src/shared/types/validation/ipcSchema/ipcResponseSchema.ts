import { z } from 'zod';

/**
 * Zod schema for IPC response envelope
 */
export const IpcResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
      details: z.any().optional(),
    })
    .optional(),
  requestId: z.string().uuid().optional(),
});
