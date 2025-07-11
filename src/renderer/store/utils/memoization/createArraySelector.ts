import type { AppState } from '../../types';
import { shallowEqual } from './shallowEqual';
import type { ArraySelectorOptions } from './ArraySelectorOptions';

/**
 * Empty array constant to avoid creating new empty arrays.
 */
const EMPTY_ARRAY: ReadonlyArray<unknown> = [];

/**
 * Creates an optimized array selector that uses shallow equality and stable references.
 * This prevents unnecessary re-renders when the array content hasn't changed.
 *
 * @param selector - The selector function that returns an array
 * @param options - Configuration options for the array selector
 * @returns A memoized array selector with stable references
 */
export const createArraySelector = <T>(
  selector: (state: AppState) => T[],
  options: ArraySelectorOptions<T> = {},
) => {
  const { equalityFn = shallowEqual, enablePerformanceMonitoring = false } = options;

  let lastState: AppState | undefined;
  let lastResult: T[] = [];
  let callCount = 0;
  let cacheHits = 0;
  let totalExecutionTime = 0;

  const arraySelector = (state: AppState): T[] => {
    callCount++;
    const startTime = enablePerformanceMonitoring ? performance.now() : 0;

    // Quick reference check first
    if (lastState === state) {
      cacheHits++;
      return lastResult;
    }

    // Compute new result
    const newResult = selector(state);

    // Return stable empty array reference if empty
    if (newResult.length === 0) {
      lastState = state;
      lastResult = EMPTY_ARRAY as T[];

      if (enablePerformanceMonitoring) {
        totalExecutionTime += performance.now() - startTime;
      }

      return lastResult;
    }

    // Check if the new result is equal to the last result
    if (lastResult.length === newResult.length && equalityFn(lastResult, newResult)) {
      cacheHits++;
      lastState = state;

      if (enablePerformanceMonitoring) {
        totalExecutionTime += performance.now() - startTime;
      }

      return lastResult;
    }

    // Cache the new result
    lastState = state;
    lastResult = newResult;

    if (enablePerformanceMonitoring) {
      totalExecutionTime += performance.now() - startTime;
    }

    return lastResult;
  };

  // Attach utility methods
  Object.assign(arraySelector, {
    /**
     * Gets performance metrics for the array selector.
     */
    getMetrics: () => ({
      totalCalls: callCount,
      cacheHits,
      cacheMisses: callCount - cacheHits,
      cacheHitRatio: callCount > 0 ? (cacheHits / callCount) * 100 : 0,
      averageExecutionTime: callCount > 0 ? totalExecutionTime / callCount : 0,
      totalExecutionTime,
    }),

    /**
     * Clears the cache and resets metrics.
     */
    clearCache: () => {
      lastState = undefined;
      lastResult = [];
      callCount = 0;
      cacheHits = 0;
      totalExecutionTime = 0;
    },

    /**
     * Gets the current cache size (always 1 for array selectors).
     */
    getCacheSize: () => (lastState ? 1 : 0),

    /**
     * Checks if the selector has a cached result.
     */
    hasCachedResult: () => lastState !== undefined,
  });

  return arraySelector;
};
