/**
 * Options for creating a memoized selector.
 */
export interface MemoizedSelectorOptions<T> {
  /**
   * Custom equality function for comparing results.
   * @param a - Previous result
   * @param b - New result
   * @returns True if values are equal, false otherwise
   */
  equalityFn?: (a: T, b: T) => boolean;

  /**
   * Stable fallback value for undefined/null results.
   * Prevents new references from being created.
   */
  fallbackValue?: T;

  /**
   * Maximum number of cached results to keep.
   * @default 1
   */
  maxCacheSize?: number;

  /**
   * Whether to enable performance monitoring.
   * @default false
   */
  enablePerformanceMonitoring?: boolean;
}
