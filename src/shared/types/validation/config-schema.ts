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

/**
 * Zod schema for theme values
 */
export const ThemeSchema = z.enum(['light', 'dark', 'system']);

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
