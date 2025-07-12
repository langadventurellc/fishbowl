import { z } from 'zod';
import { WindowStateSchema } from './windowStateSchema';

/**
 * Zod schema for configuration values
 */
export const ConfigValueSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  windowState: WindowStateSchema,
  devTools: z.boolean(),
  autoUpdater: z.boolean(),
  telemetry: z.boolean(),
});
