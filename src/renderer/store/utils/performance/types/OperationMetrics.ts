import type { OperationRecord } from './OperationRecord';
import type { OperationMetadata } from './OperationMetadata';

/**
 * Metrics for a single store operation.
 */
export interface OperationMetrics {
  operationName: string;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  totalExecutionTime: number;
  averageExecutionTime: number;
  minExecutionTime: number;
  maxExecutionTime: number;
  totalMemoryUsage: number;
  averageMemoryUsage: number;
  totalStateSizeChange: number;
  averageStateSizeChange: number;
  recentRecords: OperationRecord[];
  errors: Array<{
    timestamp: number;
    error: Error;
    metadata: OperationMetadata;
  }>;
  frequencyPerSecond: number;
  lastCallTimestamp: number;
}
