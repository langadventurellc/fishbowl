import { RetryOptions } from './RetryOptions';

export const calculateDelay = (attempt: number, options: RetryOptions): number => {
  if (!options.exponentialBackoff) {
    return options.baseDelay;
  }

  const exponentialDelay = options.baseDelay * Math.pow(2, attempt - 1);
  return Math.min(exponentialDelay, options.maxDelay);
};
