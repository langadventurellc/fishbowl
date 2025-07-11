/**
 * Interface for selectors that provide performance metrics.
 */
export interface SelectorWithMetrics {
  getMetrics(): {
    totalCalls: number;
    cacheHits: number;
    cacheMisses: number;
    averageExecutionTime: number;
    [key: string]: unknown;
  };
  clearCache(): void;
  getCacheSize?(): number;
  getCacheHitRatio?(): number;
}
