import type { LogContext } from "./types";
import type { LoggerConfig } from "./config/LogConfig";

/**
 * Configuration options for creating a logger instance.
 *
 * This interface defines the parameters that can be passed to `createLogger()`
 * and `createLoggerSync()` to customize logger behavior and initial context.
 *
 * @example
 * ```typescript
 * // Basic options
 * const options: CreateLoggerOptions = {
 *   config: {
 *     name: 'my-service',
 *     level: 'info'
 *   }
 * };
 *
 * // With custom context
 * const options: CreateLoggerOptions = {
 *   config: {
 *     name: 'user-service',
 *     level: 'debug',
 *     includeDeviceInfo: true
 *   },
 *   context: {
 *     userId: '123',
 *     requestId: 'req-456',
 *     metadata: {
 *       feature: 'authentication'
 *     }
 *   }
 * };
 *
 * // Production configuration
 * const prodOptions: CreateLoggerOptions = {
 *   config: {
 *     name: 'production-app',
 *     level: 'warn',
 *     includeDeviceInfo: false,
 *     transports: [
 *       { type: 'console', options: { colorize: false } }
 *     ]
 *   }
 * };
 * ```
 *
 * @see {@link LoggerConfig} for detailed configuration options
 * @see {@link LogContext} for context structure documentation
 * @see {@link createLogger} and {@link createLoggerSync} for usage
 *
 * @since 1.0.0
 */
export interface CreateLoggerOptions {
  /**
   * Logger configuration settings.
   *
   * Partial configuration object that will be merged with environment-specific
   * defaults (development, production, or test configs).
   *
   * @example
   * ```typescript
   * config: {
   *   name: 'my-service',        // Logger namespace
   *   level: 'debug',           // Minimum log level
   *   includeDeviceInfo: true,  // Include device/system info
   *   transports: [             // Custom transport configuration
   *     { type: 'console', options: { colorize: true } }
   *   ]
   * }
   * ```
   */
  config?: Partial<LoggerConfig>;

  /**
   * Initial context data to include with all log entries.
   *
   * This context will be automatically included in every log message from
   * this logger instance. It's useful for request tracking, user identification,
   * or component-specific metadata.
   *
   * @example
   * ```typescript
   * context: {
   *   userId: '123',
   *   requestId: 'req-456',
   *   component: 'auth-service',
   *   metadata: {
   *     version: '1.2.3',
   *     feature: 'login'
   *   }
   * }
   * ```
   */
  context?: LogContext;
}
