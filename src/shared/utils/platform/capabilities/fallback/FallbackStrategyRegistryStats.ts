/**
 * Statistics for the fallback strategy registry.
 * Tracks performance and usage metrics for monitoring.
 */

export interface FallbackStrategyRegistryStats {
  /** Total number of registered strategies */
  totalStrategies: number;

  /** Number of capabilities with registered strategies */
  capabilitiesWithStrategies: number;

  /** Average strategies per capability */
  averageStrategiesPerCapability: number;

  /** Applicability cache hit rate (0-1) */
  cacheHitRate: number;

  /** Total applicability checks performed */
  totalApplicabilityChecks: number;

  /** Cache hits during applicability checks */
  cacheHits: number;

  /** Memory usage estimate in bytes */
  memoryUsageBytes: number;
}
