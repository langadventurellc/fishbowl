/**
 * Platform Capability Detection Configuration Interface
 *
 * Configuration for capability detection on specific platforms.
 */

import { CapabilityCategory } from '../../constants/platform/CapabilityCategory';
import { PlatformType } from '../../constants/platform/PlatformType';

/**
 * Capability detection configuration for specific platforms
 */
export interface PlatformCapabilityDetectionConfig {
  /** Platform this configuration applies to */
  platform: PlatformType;
  /** Categories to detect on this platform */
  enabledCategories: CapabilityCategory[];
  /** Maximum time allowed for detection per capability */
  timeoutMs: number;
  /** Whether to retry failed detections */
  retryOnFailure: boolean;
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Cache duration for detection results */
  cacheDurationMs: number;
}
