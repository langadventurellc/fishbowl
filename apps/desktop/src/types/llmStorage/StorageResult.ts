/**
 * Generic result type for storage operations.
 * Provides consistent response format across all operations.
 */
export interface StorageResult<T> {
  /** Indicates whether the operation succeeded */
  success: boolean;

  /** Operation result data (when successful) */
  data?: T;

  /** Error message (when failed) */
  error?: string;
}
