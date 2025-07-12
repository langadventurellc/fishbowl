/**
 * Platform Cache Configuration Type Definition
 *
 * Defines configuration options for platform detection caching.
 */

/**
 * Platform cache configuration options
 */
export interface PlatformCacheConfig {
  /** Cache duration in milliseconds */
  cacheDurationMs: number;
  /** Enable cache debugging */
  enableDebugLogging: boolean;
}
