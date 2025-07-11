import { StoreOperationPerformanceMonitor } from './StoreOperationPerformanceMonitor';

/**
 * Gets the performance monitor instance.
 */
export const getPerformanceMonitor = () => StoreOperationPerformanceMonitor.getInstance();
