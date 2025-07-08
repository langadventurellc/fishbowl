'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __exportStar =
  (this && this.__exportStar) ||
  function (m, exports) {
    for (var p in m)
      if (p !== 'default' && !Object.prototype.hasOwnProperty.call(exports, p))
        __createBinding(exports, m, p);
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.throttle =
  exports.debounce =
  exports.generateId =
  exports.formatTimestamp =
  exports.isLinux =
  exports.isWindows =
  exports.isMac =
  exports.getPlatform =
  exports.isProd =
  exports.isDev =
    void 0;
/**
 * Check if the application is running in development mode
 */
exports.isDev = process.env.NODE_ENV === 'development';
/**
 * Check if the application is running in production mode
 */
exports.isProd = process.env.NODE_ENV === 'production';
/**
 * Get the current platform
 */
const getPlatform = () => {
  return process.platform;
};
exports.getPlatform = getPlatform;
/**
 * Check if running on macOS
 */
exports.isMac = (0, exports.getPlatform)() === 'darwin';
/**
 * Check if running on Windows
 */
exports.isWindows = (0, exports.getPlatform)() === 'win32';
/**
 * Check if running on Linux
 */
exports.isLinux = (0, exports.getPlatform)() === 'linux';
/**
 * Format a timestamp to a readable string
 */
const formatTimestamp = timestamp => {
  return new Date(timestamp).toLocaleString();
};
exports.formatTimestamp = formatTimestamp;
/**
 * Generate a unique ID
 */
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};
exports.generateId = generateId;
/**
 * Debounce function
 */
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};
exports.debounce = debounce;
/**
 * Throttle function
 */
const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
exports.throttle = throttle;
// Export IPC utilities
__exportStar(require('./ipc'), exports);
