import { StoreOperationPerformanceMonitor } from './StoreOperationPerformanceMonitor';
import type { GlobalOperationMetrics } from './types';

/**
 * Subscribes to performance metrics updates.
 */
export const subscribeToPerformanceMetrics = (
  callback: (metrics: GlobalOperationMetrics) => void,
) => {
  const monitor = StoreOperationPerformanceMonitor.getInstance();
  return monitor.subscribe(callback);
};
