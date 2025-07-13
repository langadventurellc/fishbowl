/**
 * Platform Cache Configuration Validation Schema
 *
 * Provides secure validation for platform cache configuration to prevent
 * resource exhaustion and ensure reasonable cache behavior.
 */

import { z } from 'zod';

/**
 * Cache configuration bounds for security and performance
 * - MIN_CACHE_DURATION: 1 second (1000ms) - minimum reasonable cache time
 * - MAX_CACHE_DURATION: 24 hours (86400000ms) - maximum reasonable cache time
 * - DEFAULT_CACHE_DURATION: 1 hour (3600000ms) - from PLATFORM_DETECTION_CONFIG
 */
// Base minimum cache duration - this will be checked dynamically during validation
const BASE_MIN_CACHE_DURATION_MS = 1000; // 1 second
const MAX_CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const DEFAULT_CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

/**
 * Zod schema for validating complete PlatformCacheConfig objects
 *
 * Ensures that cache configuration is:
 * - Has valid cache duration within reasonable bounds
 * - Has proper boolean flag for debug logging
 * - Cannot be used for resource exhaustion attacks
 * - Maintains performance requirements
 *
 * @example
 * ```typescript
 * PlatformCacheConfigSchema.parse({
 *   cacheDurationMs: 3600000,
 *   enableDebugLogging: false
 * }); // => valid config
 *
 * PlatformCacheConfigSchema.parse({
 *   cacheDurationMs: -1,
 *   enableDebugLogging: false
 * }); // throws ZodError
 * ```
 */
export const PlatformCacheConfigSchema = z.object({
  cacheDurationMs: z
    .number({
      required_error: 'Cache duration is required',
      invalid_type_error: 'Cache duration must be a number',
    })
    .int('Cache duration must be an integer')
    .max(
      MAX_CACHE_DURATION_MS,
      `Cache duration must not exceed ${MAX_CACHE_DURATION_MS}ms (24 hours)`,
    )
    .min(
      BASE_MIN_CACHE_DURATION_MS,
      `Cache duration must be at least ${BASE_MIN_CACHE_DURATION_MS}ms (1 second)`,
    )
    .default(DEFAULT_CACHE_DURATION_MS),

  enableDebugLogging: z
    .boolean({
      required_error: 'Debug logging flag is required',
      invalid_type_error: 'Debug logging flag must be a boolean',
    })
    .default(false),
});
