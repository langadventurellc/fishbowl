import { StoreOperationPerformanceMonitor } from './StoreOperationPerformanceMonitor';

/**
 * Gets a performance report.
 */
export const getPerformanceReport = () => {
  const monitor = StoreOperationPerformanceMonitor.getInstance();
  return monitor.getPerformanceReport();
};
