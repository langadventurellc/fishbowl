/**
 * Options for creating an array selector.
 */
export interface ArraySelectorOptions<T> {
  /**
   * Custom equality function for comparing array elements.
   * @param a - Previous array
   * @param b - New array
   * @returns True if arrays are equal, false otherwise
   */
  equalityFn?: (a: T[], b: T[]) => boolean;

  /**
   * Whether to enable performance monitoring.
   * @default false
   */
  enablePerformanceMonitoring?: boolean;

  /**
   * Maximum number of cached results to keep.
   * @default 1
   */
  maxCacheSize?: number;
}
