/**
 * Options for creating a parameterized selector.
 */
export interface ParameterizedSelectorOptions<T> {
  /**
   * Custom equality function for comparing results.
   * @param a - Previous result
   * @param b - New result
   * @returns True if results are equal, false otherwise
   */
  equalityFn?: (a: T, b: T) => boolean;

  /**
   * Custom equality function for comparing parameters.
   * @param a - Previous parameters
   * @param b - New parameters
   * @returns True if parameters are equal, false otherwise
   */
  parameterEqualityFn?: (a: unknown[], b: unknown[]) => boolean;

  /**
   * Maximum number of cached results to keep.
   * @default 10
   */
  maxCacheSize?: number;

  /**
   * Whether to enable performance monitoring.
   * @default false
   */
  enablePerformanceMonitoring?: boolean;

  /**
   * Fallback value to use when selector returns null/undefined.
   */
  fallbackValue?: T;
}
