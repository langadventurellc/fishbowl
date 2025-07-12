/**
 * Platform Cache Entry Type Definition
 *
 * Defines the structure for cached platform detection results.
 */

import type { PlatformType } from '../../constants/platform/PlatformType';
import type { PlatformInfo } from './PlatformInfo';

/**
 * Platform cache entry containing detection results and metadata
 */
export interface PlatformCacheEntry {
  /** Cached platform type */
  platformType: PlatformType;
  /** Cached platform information */
  platformInfo: PlatformInfo;
  /** Cache entry timestamp for TTL validation */
  timestamp: number;
}
