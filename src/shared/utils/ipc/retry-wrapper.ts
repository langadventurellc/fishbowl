/**
 * Retry wrapper for IPC calls
 */

import { IpcError } from './ipc-error';

export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 100,
  channel: string = 'unknown',
): Promise<T> => {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries - 1) {
        throw new IpcError(`IPC failed after ${maxRetries} attempts`, channel, lastError);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
    }
  }

  throw new IpcError(`Unexpected error in retry logic`, channel, lastError);
};
