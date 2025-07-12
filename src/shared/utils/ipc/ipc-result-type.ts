/**
 * Type-safe IPC result wrapper type
 */

import { IpcError } from './ipc-error';

export type IpcResult<T> = { success: true; data: T } | { success: false; error: IpcError };
