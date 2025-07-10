import { DatabaseErrorType } from './DatabaseErrorType';

/**
 * Error recovery strategies
 */

export interface RetryOptions {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  exponentialBackoff: boolean;
  retryOn: DatabaseErrorType[];
}
