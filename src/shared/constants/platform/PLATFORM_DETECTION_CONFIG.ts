/**
 * Platform detection configuration constants
 */
export const PLATFORM_DETECTION_CONFIG = {
  /** Maximum time in milliseconds for platform detection */
  MAX_DETECTION_TIME_MS: 100,
  /** Target time in milliseconds for cached platform detection */
  CACHED_DETECTION_TARGET_MS: 1,
  /** Default cache duration in milliseconds */
  CACHE_DURATION_MS: 60 * 60 * 1000, // 1 hour
  /** Enable detailed platform logging for debugging */
  ENABLE_DEBUG_LOGGING: false,
} as const;
