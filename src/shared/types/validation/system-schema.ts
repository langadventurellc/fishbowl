import { z } from 'zod';

/**
 * Zod schema for system information
 */
export const SystemInfoSchema = z.object({
  platform: z.string(),
  arch: z.string(),
  version: z.string(),
  appVersion: z.string(),
  electronVersion: z.string(),
  chromeVersion: z.string(),
  nodeVersion: z.string(),
  memory: z.object({
    used: z.number(),
    total: z.number(),
  }),
});

/**
 * Zod schema for platform information
 */
export const PlatformSchema = z.string();

/**
 * Zod schema for architecture information
 */
export const ArchSchema = z.string();

/**
 * Zod schema for version information
 */
export const VersionSchema = z.string();
