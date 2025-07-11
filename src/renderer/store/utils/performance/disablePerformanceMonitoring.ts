import { StoreOperationPerformanceMonitor } from './StoreOperationPerformanceMonitor';

/**
 * Disables performance monitoring globally.
 */
export const disablePerformanceMonitoring = () => {
  const monitor = StoreOperationPerformanceMonitor.getInstance();
  monitor.disable();
};
