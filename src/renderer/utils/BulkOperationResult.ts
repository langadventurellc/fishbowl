export interface BulkOperationResult<T> {
  success: boolean;
  successfulOperations: T[];
  failedOperations: Array<{ item: unknown; error: string }>;
  totalProcessed: number;
}
