/**
 * Create success IPC result
 */

import { IpcResult } from './ipc-result-type';

export const createIpcResult = <T>(data: T): IpcResult<T> => ({
  success: true,
  data,
});
