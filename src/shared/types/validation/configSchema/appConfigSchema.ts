import { z } from 'zod';
import { WindowStateSchema } from './windowStateSchema';
import { ThemeSchema } from './themeSchema';

/**
 * Zod schema for application configuration
 */
export const AppConfigSchema = z.object({
  window: WindowStateSchema,
  theme: ThemeSchema,
  autoUpdater: z.object({
    enabled: z.boolean(),
    checkInterval: z.number().min(0),
  }),
});
