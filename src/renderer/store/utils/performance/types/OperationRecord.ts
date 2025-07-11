import type { OperationMetadata } from './OperationMetadata';

/**
 * Record of a single store operation performance.
 */
export interface OperationRecord {
  executionTime: number;
  memoryUsage: number;
  stateSizeChange: number;
  beforeStateSize: number;
  afterStateSize: number;
  success: boolean;
  error: Error | null;
  metadata: OperationMetadata;
  timestamp: number;
}
