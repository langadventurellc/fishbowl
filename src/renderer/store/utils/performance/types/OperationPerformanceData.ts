import type { OperationMetrics } from './OperationMetrics';

/**
 * Performance data for a single operation.
 */
export interface OperationPerformanceData {
  operationName: string;
  metrics: OperationMetrics;
  successRate: number;
  isHighFrequency: boolean;
  isMemoryIntensive: boolean;
  hasRecentErrors: boolean;
}
