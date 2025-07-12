/**
 * Create error IPC result
 */

import { IpcError } from './ipc-error';
import { IpcResult } from './ipc-result-type';

export const createIpcError = (error: Error, channel: string): IpcResult<never> => ({
  success: false,
  error: error instanceof IpcError ? error : new IpcError(error.message, channel, error),
});
