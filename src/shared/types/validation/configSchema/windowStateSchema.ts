import { z } from 'zod';

/**
 * Zod schema for window state
 */
export const WindowStateSchema = z.object({
  width: z.number().min(1),
  height: z.number().min(1),
  x: z.number().optional(),
  y: z.number().optional(),
  isMaximized: z.boolean(),
  isMinimized: z.boolean(),
  isFullscreen: z.boolean(),
});
