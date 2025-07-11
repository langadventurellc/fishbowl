import type { AppState } from '../../types';
import type { MemoizedSelectorOptions } from './MemoizedSelectorOptions';
import type { SelectorPerformanceMetrics } from './SelectorPerformanceMetrics';

/**
 * Cache entry for memoized selector results.
 */
interface CacheEntry<T> {
  /** The cached result */
  result: T;
  /** The state that produced this result */
  state: AppState;
  /** Timestamp when this entry was created */
  timestamp: number;
  /** Number of times this entry has been accessed */
  accessCount: number;
}

/**
 * Creates a memoized selector with performance optimization and monitoring.
 *
 * @param selector - The selector function to memoize
 * @param options - Configuration options for memoization
 * @returns A memoized selector function with performance metrics
 */
export const createMemoizedSelector = <T>(
  selector: (state: AppState) => T,
  options: MemoizedSelectorOptions<T> = {},
) => {
  const {
    equalityFn = Object.is,
    fallbackValue,
    maxCacheSize = 1,
    enablePerformanceMonitoring = false,
  } = options;

  const cache: CacheEntry<T>[] = [];
  const metrics: SelectorPerformanceMetrics = {
    totalCalls: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageExecutionTime: 0,
    lastExecutionTime: 0,
    maxExecutionTime: 0,
    minExecutionTime: Infinity,
  };

  const memoizedSelector = (state: AppState): T => {
    metrics.totalCalls++;
    const startTime = enablePerformanceMonitoring ? performance.now() : 0;

    // Check cache for existing result
    const cacheEntry = cache.find(entry => entry.state === state);

    if (cacheEntry) {
      metrics.cacheHits++;
      cacheEntry.accessCount++;

      if (enablePerformanceMonitoring) {
        const executionTime = performance.now() - startTime;
        metrics.lastExecutionTime = executionTime;
        updateMetrics(executionTime);
      }

      return cacheEntry.result;
    }

    // Cache miss - compute new result
    metrics.cacheMisses++;
    const result = selector(state);
    const finalResult = result ?? fallbackValue ?? result;

    // Find matching result in cache using equality function
    const existingEntry = cache.find(entry => equalityFn(entry.result, finalResult));

    if (existingEntry) {
      // Update the existing entry with new state
      existingEntry.state = state;
      existingEntry.timestamp = Date.now();
      existingEntry.accessCount++;

      if (enablePerformanceMonitoring) {
        const executionTime = performance.now() - startTime;
        metrics.lastExecutionTime = executionTime;
        updateMetrics(executionTime);
      }

      return existingEntry.result;
    }

    // Create new cache entry
    const newEntry: CacheEntry<T> = {
      result: finalResult,
      state,
      timestamp: Date.now(),
      accessCount: 1,
    };

    cache.push(newEntry);

    // Maintain cache size limit
    if (cache.length > maxCacheSize) {
      // Remove least recently used entry
      cache.sort((a, b) => b.timestamp - a.timestamp);
      cache.splice(maxCacheSize);
    }

    if (enablePerformanceMonitoring) {
      const executionTime = performance.now() - startTime;
      metrics.lastExecutionTime = executionTime;
      updateMetrics(executionTime);
    }

    return finalResult;
  };

  const updateMetrics = (executionTime: number) => {
    metrics.averageExecutionTime =
      (metrics.averageExecutionTime * (metrics.totalCalls - 1) + executionTime) /
      metrics.totalCalls;
    metrics.maxExecutionTime = Math.max(metrics.maxExecutionTime, executionTime);
    metrics.minExecutionTime = Math.min(metrics.minExecutionTime, executionTime);
  };

  // Attach utility methods to the memoized selector
  Object.assign(memoizedSelector, {
    /**
     * Gets the current performance metrics.
     */
    getMetrics: () => ({ ...metrics }),

    /**
     * Clears the cache and resets metrics.
     */
    clearCache: () => {
      cache.length = 0;
      Object.assign(metrics, {
        totalCalls: 0,
        cacheHits: 0,
        cacheMisses: 0,
        averageExecutionTime: 0,
        lastExecutionTime: 0,
        maxExecutionTime: 0,
        minExecutionTime: Infinity,
      });
    },

    /**
     * Gets the current cache size.
     */
    getCacheSize: () => cache.length,

    /**
     * Gets the cache hit ratio as a percentage.
     */
    getCacheHitRatio: () => {
      if (metrics.totalCalls === 0) return 0;
      return (metrics.cacheHits / metrics.totalCalls) * 100;
    },

    /**
     * Gets detailed cache information.
     */
    getCacheInfo: () => ({
      size: cache.length,
      maxSize: maxCacheSize,
      entries: cache.map(entry => ({
        timestamp: entry.timestamp,
        accessCount: entry.accessCount,
      })),
    }),
  });

  return memoizedSelector;
};
