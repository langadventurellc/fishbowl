/**
 * Query metrics interface
 */
export interface QueryMetrics {
  queryName: string;
  executionTime: number;
  rowsAffected: number;
  timestamp: number;
  parameters?: unknown[];
}
