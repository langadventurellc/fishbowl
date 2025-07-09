import { calculateDelay } from './database/calculateDelay';
import { DatabaseError } from './database/DatabaseError';
import { DatabaseErrorType } from './database/DatabaseErrorType';
import { DEFAULT_RETRY_OPTIONS } from './database/DEFAULT_RETRY_OPTIONS';
import { parseError } from './database/parseError';
import { RetryOptions } from './database/RetryOptions';
import { delay } from './delay';

export const withRetry = async <T>(
  operation: () => Promise<T>,
  operationName: string,
  options: Partial<RetryOptions> = {},
): Promise<T> => {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: DatabaseError | undefined;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const dbError = parseError(error, operationName);
      lastError = dbError;

      // Don't retry if error type is not in retryOn list
      if (!opts.retryOn.includes(dbError.type)) {
        throw dbError;
      }

      // Don't retry on last attempt
      if (attempt === opts.maxAttempts) {
        throw dbError;
      }

      // Don't retry if error is not recoverable
      if (!dbError.recoverable) {
        throw dbError;
      }

      // Wait before retrying
      const delayMs = calculateDelay(attempt, opts);
      await delay(delayMs);
    }
  }

  // This should never be reached, but just in case
  throw (
    lastError ??
    new DatabaseError('Maximum retry attempts exceeded', DatabaseErrorType.UNKNOWN, operationName)
  );
};
