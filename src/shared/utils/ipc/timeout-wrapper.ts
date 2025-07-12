/**
 * Timeout wrapper for IPC calls
 */

import { IpcError } from './ipc-error';

export const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number = 5000,
  channel: string = 'unknown',
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new IpcError(`IPC timeout after ${timeoutMs}ms`, channel));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } catch (error) {
    if (error instanceof IpcError) {
      throw error;
    }
    throw new IpcError(`IPC error in channel ${channel}`, channel, error as Error);
  }
};
