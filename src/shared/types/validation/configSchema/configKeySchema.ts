import { z } from 'zod';

/**
 * Zod schema for configuration keys
 */
export const ConfigKeySchema = z.enum([
  'theme',
  'windowState',
  'devTools',
  'autoUpdater',
  'telemetry',
]);
