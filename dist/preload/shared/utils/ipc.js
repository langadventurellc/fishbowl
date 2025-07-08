'use strict';
/**
 * Type-safe IPC wrapper utilities for secure communication
 * between main and renderer processes
 */
Object.defineProperty(exports, '__esModule', { value: true });
exports.ipcPerformanceMonitor =
  exports.IpcPerformanceMonitor =
  exports.throttle =
  exports.debounce =
  exports.createIpcError =
  exports.createIpcResult =
  exports.validateChannelArgs =
  exports.withRetry =
  exports.withTimeout =
  exports.IpcError =
  exports.isValidChannel =
    void 0;
// Type guard to validate IPC channel names
const isValidChannel = channel => {
  const validChannels = [
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
  return validChannels.includes(channel);
};
exports.isValidChannel = isValidChannel;
// Error handling for IPC communication
class IpcError extends Error {
  constructor(message, channel, originalError) {
    super(message);
    this.channel = channel;
    this.originalError = originalError;
    this.name = 'IpcError';
    this.channel = channel;
    this.originalError = originalError;
  }
}
exports.IpcError = IpcError;
// Timeout wrapper for IPC calls
const withTimeout = async (promise, timeoutMs = 5000, channel = 'unknown') => {
  const timeoutPromise = new Promise((_, reject) => {
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
    throw new IpcError(`IPC error in channel ${channel}`, channel, error);
  }
};
exports.withTimeout = withTimeout;
// Retry wrapper for IPC calls
const withRetry = async (fn, maxRetries = 3, delayMs = 100, channel = 'unknown') => {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries - 1) {
        throw new IpcError(`IPC failed after ${maxRetries} attempts`, channel, lastError);
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
    }
  }
  throw new IpcError(`Unexpected error in retry logic`, channel, lastError);
};
exports.withRetry = withRetry;
// Validation helpers
const validateChannelArgs = (channel, args) => {
  if (!(0, exports.isValidChannel)(channel)) {
    throw new IpcError(`Invalid IPC channel: ${String(channel)}`, String(channel));
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
      if (args.length !== 1 || !['light', 'dark', 'system'].includes(args[0])) {
        throw new IpcError(`Invalid theme value for ${channel}`, channel);
      }
      break;
    default:
      // No specific validation needed for other channels
      break;
  }
};
exports.validateChannelArgs = validateChannelArgs;
const createIpcResult = data => ({
  success: true,
  data,
});
exports.createIpcResult = createIpcResult;
const createIpcError = (error, channel) => ({
  success: false,
  error: error instanceof IpcError ? error : new IpcError(error.message, channel, error),
});
exports.createIpcError = createIpcError;
// Debounce utility for IPC calls
const debounce = (fn, delayMs) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(() => {
        void fn(...args)
          .then(resolve)
          .catch(reject);
      }, delayMs);
    });
  };
};
exports.debounce = debounce;
// Throttle utility for IPC calls
const throttle = (fn, delayMs) => {
  let lastCall = 0;
  let timeoutId;
  return (...args) => {
    const now = Date.now();
    return new Promise((resolve, reject) => {
      if (now - lastCall >= delayMs) {
        lastCall = now;
        void fn(...args)
          .then(resolve)
          .catch(reject);
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(
          () => {
            lastCall = Date.now();
            void fn(...args)
              .then(resolve)
              .catch(reject);
          },
          delayMs - (now - lastCall),
        );
      }
    });
  };
};
exports.throttle = throttle;
class IpcPerformanceMonitor {
  constructor() {
    this.metrics = [];
    this.maxMetrics = 100;
  }
  startCall(_channel) {
    return performance.now();
  }
  endCall(channel, startTime, success, error) {
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
  getMetrics() {
    return [...this.metrics];
  }
  getAverageResponseTime(channel) {
    const filteredMetrics = channel
      ? this.metrics.filter(m => m.channel === channel)
      : this.metrics;
    if (filteredMetrics.length === 0) return 0;
    const totalDuration = filteredMetrics.reduce((sum, m) => sum + m.duration, 0);
    return totalDuration / filteredMetrics.length;
  }
  getSuccessRate(channel) {
    const filteredMetrics = channel
      ? this.metrics.filter(m => m.channel === channel)
      : this.metrics;
    if (filteredMetrics.length === 0) return 0;
    const successCount = filteredMetrics.filter(m => m.success).length;
    return successCount / filteredMetrics.length;
  }
  clear() {
    this.metrics = [];
  }
}
exports.IpcPerformanceMonitor = IpcPerformanceMonitor;
// Global performance monitor instance
exports.ipcPerformanceMonitor = new IpcPerformanceMonitor();
