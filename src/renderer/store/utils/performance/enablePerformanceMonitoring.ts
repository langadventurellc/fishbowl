import { StoreOperationPerformanceMonitor } from './StoreOperationPerformanceMonitor';

/**
 * Enables performance monitoring globally.
 */
export const enablePerformanceMonitoring = (intervalMs?: number) => {
  const monitor = StoreOperationPerformanceMonitor.getInstance();
  monitor.enable(intervalMs);
};
