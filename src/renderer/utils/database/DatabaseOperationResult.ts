/**
 * Database operation result types
 */

export interface DatabaseOperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
