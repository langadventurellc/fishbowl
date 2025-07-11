import { StoreOperationPerformanceMonitor } from './StoreOperationPerformanceMonitor';

/**
 * Gets current performance metrics.
 */
export const getPerformanceMetrics = () => {
  const monitor = StoreOperationPerformanceMonitor.getInstance();
  return monitor.getCurrentMetrics();
};
