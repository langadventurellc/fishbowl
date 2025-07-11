import { StoreOperationPerformanceMonitor } from './StoreOperationPerformanceMonitor';

/**
 * Monitors a custom operation outside of store operations.
 */
export const monitorCustomOperation = async <T>(
  operationName: string,
  operation: () => T | Promise<T>,
  metadata?: Record<string, unknown>,
): Promise<T> => {
  const monitor = StoreOperationPerformanceMonitor.getInstance();
  return monitor.monitorOperation(operationName, operation, {
    operationType: 'custom',
    ...metadata,
  });
};
