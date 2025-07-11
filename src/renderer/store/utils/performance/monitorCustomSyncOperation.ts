import { StoreOperationPerformanceMonitor } from './StoreOperationPerformanceMonitor';

/**
 * Monitors a custom synchronous operation outside of store operations.
 */
export const monitorCustomSyncOperation = <T>(
  operationName: string,
  operation: () => T,
  metadata?: Record<string, unknown>,
): T => {
  const monitor = StoreOperationPerformanceMonitor.getInstance();
  return monitor.monitorSyncOperation(operationName, operation, {
    operationType: 'custom',
    ...metadata,
  });
};
