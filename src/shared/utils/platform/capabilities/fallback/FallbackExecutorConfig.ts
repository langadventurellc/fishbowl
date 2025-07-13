/**
 * Configuration for the fallback executor.
 * Controls execution behavior, performance limits, and error handling.
 */

export interface FallbackExecutorConfig {
  /** Maximum time allowed for all fallback strategies in milliseconds */
  maxTotalExecutionTimeMs: number;

  /** Maximum time allowed per individual strategy in milliseconds */
  maxStrategyExecutionTimeMs: number;

  /** Whether to stop execution after first successful strategy */
  stopOnFirstSuccess: boolean;

  /** Whether to continue execution if a strategy fails */
  continueOnFailure: boolean;

  /** Maximum number of strategies to execute */
  maxStrategiesToExecute: number;

  /** Whether to collect performance metrics */
  enablePerformanceMetrics: boolean;

  /** Whether to enable memory usage tracking */
  enableMemoryTracking: boolean;
}
