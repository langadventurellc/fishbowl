/**
 * Platform Capability Detection Configuration Interface
 *
 * Configuration for capability detection on specific platforms.
 */

import { CapabilityCategory } from '../../constants/platform/CapabilityCategory';
import { PlatformType } from '../../constants/platform/PlatformType';

/**
 * Capability detection configuration for specific platforms
 *
 * This configuration controls how platform capabilities are detected,
 * validated, and cached. Different platforms require different detection
 * strategies due to varying API availability and performance characteristics.
 *
 * @example
 * ```typescript
 * const electronConfig: PlatformCapabilityDetectionConfig = {
 *   platform: PlatformType.ELECTRON,
 *   enabledCategories: [CapabilityCategory.FILESYSTEM, CapabilityCategory.STORAGE],
 *   timeoutMs: 5000,
 *   retryOnFailure: true,
 *   maxRetries: 3,
 *   cacheDurationMs: 300000 // 5 minutes
 * };
 *
 * const webConfig: PlatformCapabilityDetectionConfig = {
 *   platform: PlatformType.WEB,
 *   enabledCategories: [CapabilityCategory.STORAGE, CapabilityCategory.NETWORKING],
 *   timeoutMs: 2000, // Shorter timeout for web
 *   retryOnFailure: false, // Less reliable connection
 *   maxRetries: 1,
 *   cacheDurationMs: 600000 // 10 minutes - longer cache
 * };
 * ```
 */
export interface PlatformCapabilityDetectionConfig {
  /**
   * Platform this configuration applies to.
   * Determines which capability detection methods are used and how
   * detection results are interpreted based on platform-specific APIs.
   */
  platform: PlatformType;
  /**
   * Categories to detect on this platform.
   * Only capabilities in these categories will be checked. Limiting
   * categories improves performance and reduces unnecessary API calls.
   * Different platforms typically support different capability sets.
   *
   * @example
   * ```typescript
   * // Electron: Full desktop capabilities
   * enabledCategories: [CapabilityCategory.FILESYSTEM, CapabilityCategory.SYSTEM]
   *
   * // Web: Limited browser capabilities
   * enabledCategories: [CapabilityCategory.STORAGE, CapabilityCategory.NETWORKING]
   * ```
   */
  enabledCategories: CapabilityCategory[];
  /**
   * Maximum time allowed for detection per capability in milliseconds.
   *
   * **Performance Guidelines:**
   * - Electron: 5000ms (can afford longer for comprehensive detection)
   * - Web: 2000ms (users expect fast page loads)
   * - Capacitor: 3000ms (mobile performance considerations)
   *
   * Shorter timeouts prevent blocking the UI but may miss slower APIs.
   * Longer timeouts provide more reliable detection at the cost of responsiveness.
   */
  timeoutMs: number;
  /**
   * Whether to retry failed detections.
   *
   * **Platform Considerations:**
   * - Electron: Usually true (stable environment, transient failures possible)
   * - Web: Often false (network issues may persist, user patience limited)
   * - Capacitor: True for system APIs, false for network-dependent features
   *
   * Retries help handle transient failures but increase total detection time.
   */
  retryOnFailure: boolean;
  /**
   * Maximum number of retry attempts for failed detections.
   * Only applies when retryOnFailure is true.
   *
   * **Recommended Values:**
   * - Production: 1-3 retries (balance reliability vs performance)
   * - Development: 0-1 retries (fail fast for debugging)
   * - Testing: 0 retries (predictable behavior)
   *
   * Each retry adds timeoutMs to total detection time.
   */
  maxRetries: number;
  /**
   * Cache duration for detection results in milliseconds.
   *
   * **Performance vs Accuracy Trade-offs:**
   * - Shorter cache (1-5 minutes): More accurate, higher CPU usage
   * - Longer cache (10-30 minutes): Better performance, may miss changes
   *
   * **Platform Guidelines:**
   * - Electron: 5-15 minutes (capabilities rarely change during session)
   * - Web: 10-30 minutes (capabilities very stable in browser context)
   * - Capacitor: 5-10 minutes (mobile context switching may affect capabilities)
   *
   * Cache duration should be shorter than expected session length but
   * long enough to provide meaningful performance benefits.
   */
  cacheDurationMs: number;
}
