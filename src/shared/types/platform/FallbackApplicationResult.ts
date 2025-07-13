import { PlatformCapabilityId } from './PlatformCapabilityId';

/**
 * Result of applying fallback strategies with comprehensive success/failure tracking.
 *
 * Enhanced result interface for tracking fallback strategy application during
 * capability detection, including detailed success metrics, failure analysis,
 * and recovery recommendations for platform capabilities.
 *
 * @example
 * ```typescript
 * const fallbackResult: FallbackApplicationResult = {
 *   success: true,
 *   appliedStrategies: ['alternative', 'degradation'],
 *   failedStrategies: [],
 *   finalRecommendation: 'USE_ALTERNATIVE_STORAGE',
 *   alternativeCapabilities: ['STORAGE_LOCAL_WRITE'],
 *   degradedFeatures: { encryptionLevel: 'basic' },
 *   executionTimeMs: 150,
 *   attemptsCount: 2,
 *   cacheUsed: false,
 *   resultCacheable: true
 * };
 * ```
 *
 * @see {@link EnhancedCapabilityDetectionResult} for usage in detection results
 * @see {@link FallbackConfig} for configuration of fallback behavior
 */
export interface FallbackApplicationResult {
  /**
   * Whether at least one fallback strategy was successfully applied.
   * True if any fallback strategy provided a viable alternative.
   */
  success: boolean;

  /**
   * List of fallback strategy names that were successfully applied.
   * Tracks which strategies provided viable alternatives.
   *
   * @example ['alternative', 'degradation']
   */
  appliedStrategies: string[];

  /**
   * List of fallback strategy names that failed during execution.
   * Tracks which strategies were attempted but couldn't provide alternatives.
   *
   * @example ['composition']
   */
  failedStrategies: string[];

  /**
   * Final recommendation from the most successful fallback strategy.
   * Provides actionable guidance for handling the capability limitation.
   *
   * @example 'USE_ALTERNATIVE_STORAGE'
   */
  finalRecommendation: string;

  /**
   * Alternative capability IDs that could provide similar functionality.
   * Ordered by preference/reliability from the fallback strategies.
   */
  alternativeCapabilities?: PlatformCapabilityId[];

  /**
   * Modified configuration or feature set for graceful degradation.
   * Contains specific adjustments to maintain functionality with reduced capabilities.
   */
  degradedFeatures?: Record<string, unknown>;

  /**
   * Total execution time for all fallback strategy attempts in milliseconds.
   * Includes time for successful and failed strategy executions.
   *
   * @minimum 0
   */
  executionTimeMs: number;

  /**
   * Total number of fallback strategy attempts made.
   * Includes both successful and failed attempts.
   *
   * @minimum 1
   */
  attemptsCount: number;

  /**
   * Whether cached fallback results were used for this application.
   * True if the result came from cache rather than fresh execution.
   */
  cacheUsed: boolean;

  /**
   * Whether this fallback result should be cached for future use.
   * Based on success state, execution time, and strategy confidence.
   */
  resultCacheable: boolean;

  /**
   * Memory usage during fallback execution in bytes.
   * Includes memory used by all attempted strategies.
   */
  memoryUsageBytes?: number;

  /**
   * Errors encountered during fallback strategy execution.
   * Organized by strategy name for detailed failure analysis.
   */
  errors?: Record<string, Error[]>;

  /**
   * Warnings generated during fallback strategy execution.
   * Non-critical issues that didn't prevent strategy success.
   */
  warnings?: string[];

  /**
   * Confidence level in the fallback solution (0.0 to 1.0).
   * Higher values indicate more reliable fallback alternatives.
   *
   * @minimum 0.0
   * @maximum 1.0
   */
  confidence?: number;

  /**
   * Whether the fallback result meets minimum functionality requirements.
   * False indicates significant feature limitations even with fallbacks.
   */
  meetsMinimumRequirements: boolean;

  /**
   * Timestamp when the fallback application was completed.
   * Used for cache expiration and result freshness tracking.
   */
  timestamp: number;

  /**
   * Custom metadata from fallback strategies.
   * Strategy-specific information for debugging or advanced usage.
   */
  metadata?: Record<string, unknown>;
}
