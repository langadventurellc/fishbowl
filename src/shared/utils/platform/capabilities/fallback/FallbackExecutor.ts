import type { PlatformCapabilityId } from '../../../../types/platform/PlatformCapabilityId';
import { DEFAULT_FALLBACK_EXECUTOR_CONFIG } from './DEFAULT_FALLBACK_EXECUTOR_CONFIG';
import type { FallbackApplicationContext } from './FallbackApplicationContext';
import type { FallbackApplicationResult } from './FallbackApplicationResult';
import { FallbackExecutionMetrics } from './FallbackExecutionMetrics';
import { FallbackExecutionResult } from './FallbackExecutionResult';
import { FallbackExecutorConfig } from './FallbackExecutorConfig';
import type { FallbackStrategy } from './FallbackStrategy';
import type { FallbackStrategyRegistry } from './FallbackStrategyRegistry';

/**
 * Orchestrates the execution of fallback strategies for failed capability detection.
 *
 * Provides priority-based strategy execution with comprehensive performance monitoring,
 * timeout protection, and error handling. Follows the established executor pattern
 * with sub-5ms execution requirements and graceful degradation.
 *
 * Features:
 * - Priority-based strategy execution order
 * - Individual and total execution timeouts
 * - Performance metrics collection and monitoring
 * - Memory usage tracking for resource management
 * - Configurable execution behavior (stop on success, continue on failure)
 * - Error aggregation and recovery recommendations
 * - Result caching support for performance optimization
 *
 * @example
 * ```typescript
 * const executor = new FallbackExecutor(registry);
 *
 * const context: FallbackApplicationContext = {
 *   capabilityId: 'storage.secure',
 *   platformType: PlatformType.WEB,
 *   detectionResult: failedResult,
 *   executionStartTime: performance.now()
 * };
 *
 * const result = await executor.executeFallbackStrategies(
 *   'storage.secure',
 *   context
 * );
 *
 * if (result.success) {
 *   console.log(`Fallback successful: ${result.message}`);
 *   console.log(`Recommendations: ${result.combinedRecommendations.join(', ')}`);
 * }
 * ```
 */
export class FallbackExecutor {
  private readonly registry: FallbackStrategyRegistry;
  private readonly config: FallbackExecutorConfig;

  constructor(registry: FallbackStrategyRegistry, config: Partial<FallbackExecutorConfig> = {}) {
    this.registry = registry;
    this.config = { ...DEFAULT_FALLBACK_EXECUTOR_CONFIG, ...config };
  }

  /**
   * Executes fallback strategies for a failed capability detection.
   *
   * @param capabilityId - The capability that failed detection
   * @param context - The fallback application context
   * @returns Promise resolving to the complete execution result
   */
  async executeFallbackStrategies(
    capabilityId: PlatformCapabilityId,
    context: FallbackApplicationContext,
  ): Promise<FallbackExecutionResult> {
    const executionStartTime = performance.now();
    const initialMemory = this.config.enableMemoryTracking ? this.getMemoryUsage() : undefined;

    const metrics: FallbackExecutionMetrics = {
      totalExecutionTimeMs: 0,
      strategiesAttempted: 0,
      strategiesSucceeded: 0,
      strategiesFailed: 0,
      strategiesTimedOut: 0,
      hasSuccessfulResult: false,
      strategyExecutionTimes: {},
      errors: [],
    };

    const allResults: FallbackApplicationResult[] = [];
    let primaryResult: FallbackApplicationResult | undefined;

    try {
      // Get applicable strategies from registry
      const strategies = await this.registry.getApplicableStrategies(capabilityId, context);

      if (strategies.length === 0) {
        return this.createNoStrategiesResult(metrics, executionStartTime);
      }

      // Execute strategies with timeout protection
      await this.executeStrategiesWithTimeout(
        strategies,
        context,
        metrics,
        allResults,
        executionStartTime,
      );

      // Find the best result
      primaryResult = this.selectPrimaryResult(allResults);
    } catch (error) {
      metrics.errors.push(error instanceof Error ? error : new Error(String(error)));
    }

    // Calculate final metrics
    metrics.totalExecutionTimeMs = performance.now() - executionStartTime;
    metrics.hasSuccessfulResult = primaryResult?.success ?? false;

    if (this.config.enableMemoryTracking && initialMemory !== undefined) {
      metrics.memoryUsageBytes = this.getMemoryUsage() - initialMemory;
    }

    return this.createExecutionResult(primaryResult, allResults, metrics);
  }

  /**
   * Executes strategies with comprehensive timeout protection.
   */
  private async executeStrategiesWithTimeout(
    strategies: FallbackStrategy[],
    context: FallbackApplicationContext,
    metrics: FallbackExecutionMetrics,
    allResults: FallbackApplicationResult[],
    executionStartTime: number,
  ): Promise<void> {
    const strategiesToExecute = strategies.slice(0, this.config.maxStrategiesToExecute);

    for (const strategy of strategiesToExecute) {
      // Check total execution timeout
      if (performance.now() - executionStartTime >= this.config.maxTotalExecutionTimeMs) {
        break;
      }

      metrics.strategiesAttempted++;
      const strategyStartTime = performance.now();

      try {
        // Execute strategy with individual timeout
        const result = await Promise.race([
          strategy.apply(context),
          this.createTimeoutPromise(strategy.id),
        ]);

        const strategyExecutionTime = performance.now() - strategyStartTime;
        metrics.strategyExecutionTimes[strategy.id] = strategyExecutionTime;

        if (result.success) {
          metrics.strategiesSucceeded++;
        } else {
          metrics.strategiesFailed++;
        }

        allResults.push(result);

        // Stop on first success if configured
        if (result.success && this.config.stopOnFirstSuccess) {
          break;
        }
      } catch (error) {
        const strategyExecutionTime = performance.now() - strategyStartTime;
        metrics.strategyExecutionTimes[strategy.id] = strategyExecutionTime;

        if (error instanceof TimeoutError) {
          metrics.strategiesTimedOut++;
        } else {
          metrics.strategiesFailed++;
        }

        metrics.errors.push(error instanceof Error ? error : new Error(String(error)));

        // Create error result for failed strategy
        allResults.push(this.createErrorResult(strategy, error, strategyExecutionTime));

        // Continue on failure if configured
        if (!this.config.continueOnFailure) {
          break;
        }
      }
    }
  }

  /**
   * Creates a timeout promise for strategy execution.
   */
  private createTimeoutPromise(strategyId: string): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(
          new TimeoutError(
            `Strategy '${strategyId}' timed out after ${this.config.maxStrategyExecutionTimeMs}ms`,
          ),
        );
      }, this.config.maxStrategyExecutionTimeMs);
    });
  }

  /**
   * Selects the best result from all strategy results.
   * Prioritizes successful results, then by execution time.
   */
  private selectPrimaryResult(
    results: FallbackApplicationResult[],
  ): FallbackApplicationResult | undefined {
    if (results.length === 0) {
      return undefined;
    }

    // First, try to find a successful result
    const successfulResults = results.filter(r => r.success);
    if (successfulResults.length > 0) {
      // Return fastest successful result
      return successfulResults.reduce((best, current) =>
        current.executionTimeMs < best.executionTimeMs ? current : best,
      );
    }

    // No successful results, return the one with most recommendations
    return results.reduce((best, current) =>
      current.recommendations.length > best.recommendations.length ? current : best,
    );
  }

  /**
   * Creates an error result for a failed strategy execution.
   */
  private createErrorResult(
    strategy: FallbackStrategy,
    error: unknown,
    executionTime: number,
  ): FallbackApplicationResult {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      message: `Strategy '${strategy.name}' failed: ${errorMessage}`,
      recommendations: [
        `Strategy '${strategy.name}' encountered an error and could not be applied`,
      ],
      executionTimeMs: executionTime,
      errors: [error instanceof Error ? error : new Error(String(error))],
      cacheable: false,
    };
  }

  /**
   * Creates a result when no strategies are available.
   */
  private createNoStrategiesResult(
    metrics: FallbackExecutionMetrics,
    executionStartTime: number,
  ): FallbackExecutionResult {
    metrics.totalExecutionTimeMs = performance.now() - executionStartTime;

    return {
      success: false,
      allResults: [],
      metrics,
      combinedRecommendations: ['No fallback strategies available for this capability'],
      allAlternativeCapabilities: [],
      cacheable: false,
      message: 'No fallback strategies found for the requested capability',
    };
  }

  /**
   * Creates the final execution result.
   */
  private createExecutionResult(
    primaryResult: FallbackApplicationResult | undefined,
    allResults: FallbackApplicationResult[],
    metrics: FallbackExecutionMetrics,
  ): FallbackExecutionResult {
    // Combine recommendations from all results
    const combinedRecommendations = Array.from(new Set(allResults.flatMap(r => r.recommendations)));

    // Combine alternative capabilities
    const allAlternativeCapabilities = Array.from(
      new Set(allResults.flatMap(r => r.alternativeCapabilities ?? [])),
    );

    // Determine if results are cacheable
    const cacheable = allResults.length > 0 && allResults.every(r => r.cacheable);

    const success = primaryResult?.success ?? false;
    const message =
      primaryResult?.message ??
      (allResults.length > 0
        ? 'Fallback strategies completed but no successful result'
        : 'No fallback strategies available');

    return {
      success,
      primaryResult,
      allResults,
      metrics,
      combinedRecommendations,
      allAlternativeCapabilities,
      cacheable,
      message,
    };
  }

  /**
   * Gets current memory usage in bytes.
   * Returns 0 if memory measurement is not available.
   */
  private getMemoryUsage(): number {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      return (performance.memory as { usedJSHeapSize: number }).usedJSHeapSize || 0;
    }
    return 0;
  }
}

/**
 * Custom error class for strategy execution timeouts.
 */
class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}
