/**
 * Check if the application is running in development mode
 */
export declare const isDev: boolean;
/**
 * Check if the application is running in production mode
 */
export declare const isProd: boolean;
/**
 * Get the current platform
 */
export declare const getPlatform: () => NodeJS.Platform;
/**
 * Check if running on macOS
 */
export declare const isMac: boolean;
/**
 * Check if running on Windows
 */
export declare const isWindows: boolean;
/**
 * Check if running on Linux
 */
export declare const isLinux: boolean;
/**
 * Format a timestamp to a readable string
 */
export declare const formatTimestamp: (timestamp: number) => string;
/**
 * Generate a unique ID
 */
export declare const generateId: () => string;
/**
 * Debounce function
 */
export declare const debounce: <T extends (...args: unknown[]) => void>(
  func: T,
  delay: number,
) => (...args: Parameters<T>) => void;
/**
 * Throttle function
 */
export declare const throttle: <T extends (...args: unknown[]) => void>(
  func: T,
  limit: number,
) => (...args: Parameters<T>) => void;
export * from './ipc';
