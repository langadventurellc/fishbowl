/**
 * Type-safe IPC wrapper utilities for secure communication
 * between main and renderer processes
 */

import type { IpcChannels } from '../types';

// Type guard to validate IPC channel names
export const isValidChannel = (channel: string): channel is keyof IpcChannels => {
  const validChannels: (keyof IpcChannels)[] = [
    'window:minimize',
    'window:maximize',
    'window:close',
    'app:getVersion',
    'system:getInfo',
    'system:platform',
    'system:arch',
    'system:version',
    'config:get',
    'config:set',
    'theme:get',
    'theme:set',
    'dev:isDev',
    'dev:openDevTools',
    'dev:closeDevTools',
  ];
  return validChannels.includes(channel as keyof IpcChannels);
};

// Error handling for IPC communication
export class IpcError extends Error {
  constructor(
    message: string,
    public channel: string,
    public originalError?: Error,
  ) {
    super(message);
    this.name = 'IpcError';
    this.channel = channel;
    this.originalError = originalError;
  }
}

// Timeout wrapper for IPC calls
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

// Retry wrapper for IPC calls
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

// Validation helpers
export const validateChannelArgs = <T extends keyof IpcChannels>(
  channel: T,
  args: Parameters<IpcChannels[T]>,
): void => {
  if (!isValidChannel(channel)) {
    const channelStr = String(channel);
    throw new IpcError(`Invalid IPC channel: ${channelStr}`, channelStr);
  }

  // Channel-specific validation
  switch (channel) {
    case 'config:get':
    case 'config:set':
      if (args.length === 0) {
        throw new IpcError(`Missing required arguments for ${channel}`, channel);
      }
      break;
    case 'theme:set':
      if (args.length !== 1 || !['light', 'dark', 'system'].includes(args[0] as string)) {
        throw new IpcError(`Invalid theme value for ${channel}`, channel);
      }
      break;
    default:
      // No specific validation needed for other channels
      break;
  }
};

// Type-safe IPC result wrapper
export type IpcResult<T> = { success: true; data: T } | { success: false; error: IpcError };

export const createIpcResult = <T>(data: T): IpcResult<T> => ({
  success: true,
  data,
});

export const createIpcError = (error: Error, channel: string): IpcResult<never> => ({
  success: false,
  error: error instanceof IpcError ? error : new IpcError(error.message, channel, error),
});

// Debounce utility for IPC calls
export const debounce = <T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  delayMs: number,
): T => {
  let timeoutId: NodeJS.Timeout;

  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);

    return new Promise<Awaited<ReturnType<T>>>((resolve, reject) => {
      timeoutId = setTimeout(() => {
        void fn(...args)
          .then(resolve as (value: unknown) => void)
          .catch(reject);
      }, delayMs);
    });
  }) as T;
};

// Throttle utility for IPC calls
export const throttle = <T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  delayMs: number,
): T => {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout;

  return ((...args: Parameters<T>) => {
    const now = Date.now();

    return new Promise<Awaited<ReturnType<T>>>((resolve, reject) => {
      if (now - lastCall >= delayMs) {
        lastCall = now;
        void fn(...args)
          .then(resolve as (value: unknown) => void)
          .catch(reject);
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(
          () => {
            lastCall = Date.now();
            void fn(...args)
              .then(resolve as (value: unknown) => void)
              .catch(reject);
          },
          delayMs - (now - lastCall),
        );
      }
    });
  }) as T;
};

// IPC performance monitoring
export interface IpcPerformanceMetrics {
  channel: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  error?: string;
}

export class IpcPerformanceMonitor {
  private metrics: IpcPerformanceMetrics[] = [];
  private maxMetrics = 100;

  startCall(_channel: string): number {
    return performance.now();
  }

  endCall(channel: string, startTime: number, success: boolean, error?: Error): void {
    const endTime = performance.now();
    const duration = endTime - startTime;

    this.metrics.push({
      channel,
      startTime,
      endTime,
      duration,
      success,
      error: error?.message,
    });

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getMetrics(): IpcPerformanceMetrics[] {
    return [...this.metrics];
  }

  getAverageResponseTime(channel?: string): number {
    const filteredMetrics = channel
      ? this.metrics.filter(m => m.channel === channel)
      : this.metrics;

    if (filteredMetrics.length === 0) return 0;

    const totalDuration = filteredMetrics.reduce((sum, m) => sum + m.duration, 0);
    return totalDuration / filteredMetrics.length;
  }

  getSuccessRate(channel?: string): number {
    const filteredMetrics = channel
      ? this.metrics.filter(m => m.channel === channel)
      : this.metrics;

    if (filteredMetrics.length === 0) return 0;

    const successCount = filteredMetrics.filter(m => m.success).length;
    return successCount / filteredMetrics.length;
  }

  clear(): void {
    this.metrics = [];
  }
}

// Global performance monitor instance
export const ipcPerformanceMonitor = new IpcPerformanceMonitor();
