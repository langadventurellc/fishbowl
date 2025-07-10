import { DatabaseErrorType } from './DatabaseErrorType';
import { RetryOptions } from './RetryOptions';

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  exponentialBackoff: true,
  retryOn: [DatabaseErrorType.CONNECTION, DatabaseErrorType.TIMEOUT],
};
