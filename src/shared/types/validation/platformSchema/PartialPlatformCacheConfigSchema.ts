/**
 * Partial Platform Cache Configuration Validation Schema
 *
 * Provides validation for partial platform cache configuration objects
 * used in constructor overrides and optional configuration.
 */

import { PlatformCacheConfigSchema } from './PlatformCacheConfigSchema';

/**
 * Zod schema for validating partial PlatformCacheConfig objects (constructor usage)
 *
 * Allows partial configuration objects where missing values will be filled
 * with defaults from PLATFORM_DETECTION_CONFIG.
 *
 * @example
 * ```typescript
 * PartialPlatformCacheConfigSchema.parse({
 *   cacheDurationMs: 1800000
 * }); // => valid partial config
 *
 * PartialPlatformCacheConfigSchema.parse({}); // => valid empty config
 * ```
 */
export const PartialPlatformCacheConfigSchema = PlatformCacheConfigSchema.partial();
