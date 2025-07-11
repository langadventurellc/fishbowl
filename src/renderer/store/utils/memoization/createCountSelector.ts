import type { AppState } from '../../types';
import type { ArraySelectorOptions } from './ArraySelectorOptions';

/**
 * Creates a memoized selector for counting array elements.
 * This is optimized for the common pattern of getting array length.
 *
 * @param getArray - Function to get the array from state
 * @param predicate - Optional function to filter array elements before counting
 * @param options - Configuration options
 * @returns A memoized count selector
 */
export const createCountSelector = <T>(
  getArray: (state: AppState) => T[],
  predicate?: (item: T, state: AppState) => boolean,
  options: Pick<ArraySelectorOptions<T>, 'enablePerformanceMonitoring'> = {},
) => {
  const { enablePerformanceMonitoring = false } = options;

  let lastState: AppState | undefined;
  let lastResult: number = 0;
  let callCount = 0;
  let cacheHits = 0;
  let totalExecutionTime = 0;

  const countSelector = (state: AppState): number => {
    callCount++;
    const startTime = enablePerformanceMonitoring ? performance.now() : 0;

    // Quick reference check first
    if (lastState === state) {
      cacheHits++;
      return lastResult;
    }

    // Compute new count
    const array = getArray(state);
    const newResult = predicate
      ? array.filter(item => predicate(item, state)).length
      : array.length;

    // Cache the new result
    lastState = state;
    lastResult = newResult;

    if (enablePerformanceMonitoring) {
      totalExecutionTime += performance.now() - startTime;
    }

    return lastResult;
  };

  // Attach utility methods
  Object.assign(countSelector, {
    /**
     * Gets performance metrics for the count selector.
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
      lastResult = 0;
      callCount = 0;
      cacheHits = 0;
      totalExecutionTime = 0;
    },

    /**
     * Gets the current cache size (always 1 for count selectors).
     */
    getCacheSize: () => (lastState ? 1 : 0),
  });

  return countSelector;
};
