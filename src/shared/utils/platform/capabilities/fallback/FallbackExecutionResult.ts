import type { PlatformCapabilityId } from '../../../../types/platform';
import type { FallbackApplicationResult } from './FallbackApplicationResult';
import { FallbackExecutionMetrics } from './FallbackExecutionMetrics';

/**
 * Complete result of fallback execution including metrics and results.
 * Combines all strategy results with execution metadata.
 */

export interface FallbackExecutionResult {
  /** Whether the overall execution was successful */
  success: boolean;

  /** The most successful strategy result (or best available) */
  primaryResult?: FallbackApplicationResult;

  /** Results from all attempted strategies */
  allResults: FallbackApplicationResult[];

  /** Execution performance metrics */
  metrics: FallbackExecutionMetrics;

  /** Combined recommendations from all strategies */
  combinedRecommendations: string[];

  /** All alternative capabilities suggested by strategies */
  allAlternativeCapabilities: PlatformCapabilityId[];

  /** Whether results should be cached for future use */
  cacheable: boolean;

  /** Overall execution message */
  message: string;
}
