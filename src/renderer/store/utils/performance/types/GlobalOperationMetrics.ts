import type { OperationPerformanceData } from './OperationPerformanceData';

/**
 * Global metrics across all store operations.
 */
export interface GlobalOperationMetrics {
  timestamp: number;
  totalOperations: number;
  totalCalls: number;
  totalExecutionTime: number;
  averageExecutionTime: number;
  slowOperations: OperationPerformanceData[];
  frequentOperations: OperationPerformanceData[];
  memoryIntensiveOperations: OperationPerformanceData[];
  errorProneOperations: OperationPerformanceData[];
  bulkOperations: OperationPerformanceData[];
  operationDetails: OperationPerformanceData[];
}
