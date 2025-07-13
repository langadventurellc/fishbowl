/**
 * Platform Cache Entry Validation Schema
 *
 * Provides validation for platform cache entry objects to ensure
 * data integrity and consistency in caching operations.
 */

import { z } from 'zod';
import { PlatformTypeSchema } from './PlatformTypeSchema';
import { PlatformInfoSchema } from './PlatformInfoSchema';
import { TimestampSchema } from './TimestampSchema';

/**
 * Zod schema for validating PlatformCacheEntry objects
 *
 * Ensures that cache entries are:
 * - Have valid platform type from enum
 * - Have valid platform information object
 * - Have valid timestamp for cache expiration
 * - Maintain consistency between platform type and platform info
 * - Are suitable for cache storage and retrieval
 *
 * @example
 * ```typescript
 * PlatformCacheEntrySchema.parse({
 *   platformType: 'electron',
 *   platformInfo: {
 *     platformType: 'electron',
 *     detections: { isElectron: true, isCapacitor: false, isWeb: false },
 *     environment: { hasWindow: true, hasElectronAPI: true, hasCapacitorAPI: false, hasNavigator: true },
 *     timestamp: Date.now()
 *   },
 *   timestamp: Date.now()
 * }); // => valid cache entry
 * ```
 */
export const PlatformCacheEntrySchema = z
  .object({
    platformType: PlatformTypeSchema,
    platformInfo: PlatformInfoSchema,
    timestamp: TimestampSchema,
  })
  .refine(
    cacheEntry => {
      // Ensure platform type consistency between entry and platform info
      return cacheEntry.platformType === cacheEntry.platformInfo.platformType;
    },
    {
      message: 'Cache entry platform type must match platform info platform type',
    },
  )
  .refine(
    cacheEntry => {
      // Ensure timestamps are reasonably close (within 1 second tolerance for processing time)
      const timeDiff = Math.abs(cacheEntry.timestamp - cacheEntry.platformInfo.timestamp);
      return timeDiff <= 1000; // 1 second tolerance
    },
    {
      message: 'Cache entry timestamp must be close to platform info timestamp (within 1 second)',
    },
  );
