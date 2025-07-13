import type { PlatformCapabilityId } from '../../../../types/platform';

/**
 * Result of applying a fallback strategy to a failed capability detection.
 * Contains success state, recommendations, and performance information.
 */

export interface FallbackApplicationResult {
  /** Whether the fallback strategy was successfully applied */
  success: boolean;

  /** Human-readable message describing the fallback action taken */
  message: string;

  /** Recommended alternative approaches or capabilities */
  recommendations: string[];

  /** Alternative capability IDs that could provide similar functionality */
  alternativeCapabilities?: PlatformCapabilityId[];

  /** Modified configuration or feature set for graceful degradation */
  degradedFeatures?: Record<string, unknown>;

  /** Performance metrics for fallback execution */
  executionTimeMs: number;

  /** Memory usage during fallback execution */
  memoryUsageBytes?: number;

  /** Any errors encountered during fallback application */
  errors?: Error[];

  /** Whether this fallback should be cached for future use */
  cacheable: boolean;
}
