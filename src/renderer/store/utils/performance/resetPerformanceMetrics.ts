import { StoreOperationPerformanceMonitor } from './StoreOperationPerformanceMonitor';

/**
 * Resets all performance metrics.
 */
export const resetPerformanceMetrics = () => {
  const monitor = StoreOperationPerformanceMonitor.getInstance();
  monitor.resetMetrics();
};
