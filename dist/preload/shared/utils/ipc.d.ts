/**
 * Type-safe IPC wrapper utilities for secure communication
 * between main and renderer processes
 */
import type { IpcChannels } from '../types';
export declare const isValidChannel: (channel: string) => channel is keyof IpcChannels;
export declare class IpcError extends Error {
  channel: string;
  originalError?: Error | undefined;
  constructor(message: string, channel: string, originalError?: Error | undefined);
}
export declare const withTimeout: <T>(
  promise: Promise<T>,
  timeoutMs?: number,
  channel?: string,
) => Promise<T>;
export declare const withRetry: <T>(
  fn: () => Promise<T>,
  maxRetries?: number,
  delayMs?: number,
  channel?: string,
) => Promise<T>;
export declare const validateChannelArgs: <T extends keyof IpcChannels>(
  channel: T,
  args: Parameters<IpcChannels[T]>,
) => void;
export type IpcResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: IpcError;
    };
export declare const createIpcResult: <T>(data: T) => IpcResult<T>;
export declare const createIpcError: (error: Error, channel: string) => IpcResult<never>;
export declare const debounce: <T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  delayMs: number,
) => T;
export declare const throttle: <T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  delayMs: number,
) => T;
export interface IpcPerformanceMetrics {
  channel: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  error?: string;
}
export declare class IpcPerformanceMonitor {
  private metrics;
  private maxMetrics;
  startCall(_channel: string): number;
  endCall(channel: string, startTime: number, success: boolean, error?: Error): void;
  getMetrics(): IpcPerformanceMetrics[];
  getAverageResponseTime(channel?: string): number;
  getSuccessRate(channel?: string): number;
  clear(): void;
}
export declare const ipcPerformanceMonitor: IpcPerformanceMonitor;
