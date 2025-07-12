/**
 * Type-safe IPC wrapper utilities for secure communication
 * between main and renderer processes
 */

export { isValidChannel } from './channel-validator';
export { IpcError } from './ipc-error';
export { withTimeout } from './timeout-wrapper';
export { withRetry } from './retry-wrapper';
export { validateChannelArgs } from './validation-helpers';
export type { IpcResult } from './ipc-result-type';
export { createIpcResult } from './create-ipc-result';
export { createIpcError } from './create-ipc-error';
export { debounce } from './debounce';
export { throttle } from './throttle';
export type { IpcPerformanceMetrics } from './performance-metrics';
export { IpcPerformanceMonitor } from './performance-monitor';
export { ipcPerformanceMonitor } from './performance-monitor-instance';
