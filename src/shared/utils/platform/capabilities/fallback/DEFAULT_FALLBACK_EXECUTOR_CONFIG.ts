import { FallbackExecutorConfig } from './FallbackExecutorConfig';

/**
 * Default configuration for the fallback executor.
 * Provides sensible defaults optimized for the 5ms execution requirement.
 */

export const DEFAULT_FALLBACK_EXECUTOR_CONFIG: FallbackExecutorConfig = {
  maxTotalExecutionTimeMs: 5, // Meet sub-5ms requirement
  maxStrategyExecutionTimeMs: 2, // Allow 2ms per strategy
  stopOnFirstSuccess: true,
  continueOnFailure: true,
  maxStrategiesToExecute: 3, // Limit to 3 strategies for performance
  enablePerformanceMetrics: true,
  enableMemoryTracking: false, // Disabled by default for performance
};
