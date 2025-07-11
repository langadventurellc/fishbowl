import type { AppState } from '../../types';
import type { ParameterizedSelectorOptions } from './ParameterizedSelectorOptions';

/**
 * Cache entry for parameterized selector results.
 */
interface ParameterizedCacheEntry<T> {
  /** The cached result */
  result: T;
  /** The parameters that produced this result */
  parameters: unknown[];
  /** The state that produced this result */
  state: AppState;
  /** Timestamp when this entry was created */
  timestamp: number;
  /** Number of times this entry has been accessed */
  accessCount: number;
}

/**
 * Performance metrics for a parameterized selector.
 */
interface ParameterizedSelectorMetrics {
  totalCalls: number;
  cacheHits: number;
  cacheMisses: number;
  averageExecutionTime: number;
  lastExecutionTime: number;
  maxExecutionTime: number;
  minExecutionTime: number;
  uniqueParameterCombinations: number;
}

/**
 * Creates a hash key for parameter combinations.
 * @param parameters - Array of parameters to hash
 * @returns A string hash key
 */
const hashParameters = (parameters: unknown[]): string => {
  return parameters
    .map(param => {
      if (param === null) return 'null';
      if (param === undefined) return 'undefined';
      if (typeof param === 'object') {
        try {
          return JSON.stringify(param);
        } catch {
          return '[object Object]';
        }
      }
      if (typeof param === 'string') return param;
      if (typeof param === 'number') return param.toString();
      if (typeof param === 'boolean') return param.toString();
      if (typeof param === 'bigint') return param.toString();
      if (typeof param === 'symbol') return param.toString();
      // This should never be reached due to the object check above
      return '[unknown]';
    })
    .join('|');
};

/**
 * Creates a memoized parameterized selector with stable references.
 * This is optimized for selector factories that take parameters.
 *
 * @param selectorFactory - Factory function that creates selectors based on parameters
 * @param options - Configuration options for the parameterized selector
 * @returns A memoized parameterized selector function
 */
export const createParameterizedSelector = <P extends unknown[], T>(
  selectorFactory: (...parameters: P) => (state: AppState) => T,
  options: ParameterizedSelectorOptions<T> = {},
) => {
  const {
    equalityFn = Object.is,
    maxCacheSize = 10,
    enablePerformanceMonitoring = false,
    fallbackValue,
  } = options;

  const cache = new Map<string, ParameterizedCacheEntry<T>>();
  const metrics: ParameterizedSelectorMetrics = {
    totalCalls: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageExecutionTime: 0,
    lastExecutionTime: 0,
    maxExecutionTime: 0,
    minExecutionTime: Infinity,
    uniqueParameterCombinations: 0,
  };

  const parameterizedSelector = (...parameters: P) => {
    const parameterHash = hashParameters(parameters);

    return (state: AppState): T => {
      metrics.totalCalls++;
      const startTime = enablePerformanceMonitoring ? performance.now() : 0;

      // Check cache for existing result
      const cacheEntry = cache.get(parameterHash);

      if (cacheEntry && cacheEntry.state === state) {
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
      const selector = selectorFactory(...parameters);
      const result = selector(state);
      const finalResult = result ?? fallbackValue ?? result;

      // Check if we have a cached result for these parameters with different state
      if (cacheEntry) {
        // Check if the result is the same using equality function
        if (equalityFn(cacheEntry.result, finalResult)) {
          // Update the cache entry with new state
          cacheEntry.state = state;
          cacheEntry.timestamp = Date.now();
          cacheEntry.accessCount++;

          if (enablePerformanceMonitoring) {
            const executionTime = performance.now() - startTime;
            metrics.lastExecutionTime = executionTime;
            updateMetrics(executionTime);
          }

          return cacheEntry.result;
        }
      }

      // Create new cache entry
      const newEntry: ParameterizedCacheEntry<T> = {
        result: finalResult,
        parameters: [...parameters],
        state,
        timestamp: Date.now(),
        accessCount: 1,
      };

      cache.set(parameterHash, newEntry);

      // Track unique parameter combinations
      if (!cacheEntry) {
        metrics.uniqueParameterCombinations++;
      }

      // Maintain cache size limit
      if (cache.size > maxCacheSize) {
        // Remove least recently used entry
        const entries = Array.from(cache.entries());
        entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
        const toRemove = entries.slice(maxCacheSize);
        toRemove.forEach(([key]) => cache.delete(key));
      }

      if (enablePerformanceMonitoring) {
        const executionTime = performance.now() - startTime;
        metrics.lastExecutionTime = executionTime;
        updateMetrics(executionTime);
      }

      return finalResult;
    };
  };

  const updateMetrics = (executionTime: number) => {
    metrics.averageExecutionTime =
      (metrics.averageExecutionTime * (metrics.totalCalls - 1) + executionTime) /
      metrics.totalCalls;
    metrics.maxExecutionTime = Math.max(metrics.maxExecutionTime, executionTime);
    metrics.minExecutionTime = Math.min(metrics.minExecutionTime, executionTime);
  };

  // Attach utility methods to the parameterized selector
  Object.assign(parameterizedSelector, {
    /**
     * Gets the current performance metrics.
     */
    getMetrics: () => ({ ...metrics }),

    /**
     * Clears the cache and resets metrics.
     */
    clearCache: () => {
      cache.clear();
      Object.assign(metrics, {
        totalCalls: 0,
        cacheHits: 0,
        cacheMisses: 0,
        averageExecutionTime: 0,
        lastExecutionTime: 0,
        maxExecutionTime: 0,
        minExecutionTime: Infinity,
        uniqueParameterCombinations: 0,
      });
    },

    /**
     * Gets the current cache size.
     */
    getCacheSize: () => cache.size,

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
      size: cache.size,
      maxSize: maxCacheSize,
      uniqueParameterCombinations: metrics.uniqueParameterCombinations,
      entries: Array.from(cache.entries()).map(([key, entry]) => ({
        parameterHash: key,
        parameters: entry.parameters,
        timestamp: entry.timestamp,
        accessCount: entry.accessCount,
      })),
    }),
  });

  return parameterizedSelector;
};
