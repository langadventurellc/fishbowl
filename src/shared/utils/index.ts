/**
 * Check if the application is running in development mode
 */
export const isDev = process.env.NODE_ENV === 'development';

/**
 * Check if the application is running in production mode
 */
export const isProd = process.env.NODE_ENV === 'production';

/**
 * Get the current platform
 */
export const getPlatform = (): NodeJS.Platform => {
  return process.platform;
};

/**
 * Check if running on macOS
 */
export const isMac = getPlatform() === 'darwin';

/**
 * Check if running on Windows
 */
export const isWindows = getPlatform() === 'win32';

/**
 * Check if running on Linux
 */
export const isLinux = getPlatform() === 'linux';

/**
 * Format a timestamp to a readable string
 */
export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function
 */
export const throttle = <T extends (...args: unknown[]) => void>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Export IPC utilities
export * from './ipc';

// Export AI utilities
export * from './ai';

// Export validation utilities
export * from './validation';

// Export platform detection utilities
export * from './platform';
