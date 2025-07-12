/**
 * Global Platform Cache Instance
 *
 * Provides the global singleton instance for platform detection caching.
 * This ensures consistent caching behavior across the entire application.
 */

import { PlatformCache } from './PlatformCache';

/**
 * Global platform cache instance
 *
 * Singleton instance for consistent caching across the application.
 * Uses default configuration from PLATFORM_DETECTION_CONFIG.
 */
export const platformCache = new PlatformCache();
