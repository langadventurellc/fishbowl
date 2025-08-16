import log from "loglevel";
import type { LogLevelNames } from "loglevel";
import type {
  LogContext,
  LogEntry,
  StructuredLogger as IStructuredLogger,
  LogConfig,
  Formatter,
  Transport,
  ErrorInfo,
} from "./types";
import { serializeError } from "./utils/errorSerializer";
import type { DeviceInfoInterface } from "./DeviceInfoInterface";
import type { CryptoUtilsInterface } from "../utils/CryptoUtilsInterface";

/**
 * Generates a random session ID without external dependencies
 */

/**
 * Core StructuredLogger implementation that provides structured logging capabilities
 * with context management, formatters, and transports.
 *
 * This class is the main logger implementation used throughout the Fishbowl application.
 * It provides structured JSON logging with automatic context injection, multiple
 * transport support, and child logger creation.
 *
 * @example
 * ```typescript
 * // Usually created via factory functions
 * const logger = await createLogger({
 *   config: { name: 'my-service', level: 'info' }
 * });
 *
 * // Basic logging
 * logger.info('User logged in', { userId: '123' });
 * logger.warn('Rate limit approaching', { requestCount: 95 });
 * logger.error('Database connection failed', dbError, { retryCount: 3 });
 *
 * // Child loggers inherit context
 * const childLogger = logger.child({ component: 'auth', requestId: 'req-456' });
 * childLogger.debug('Validating credentials');  // Includes parent + child context
 *
 * // Level management
 * logger.setLevel('debug');
 * const currentLevel = logger.getLevel(); // 'debug'
 *
 * // Transport management
 * logger.addTransport(customTransport);
 * logger.setFormatter(customFormatter);
 * ```
 *
 * @remarks
 * Key features:
 * - **Structured Logs**: All logs are JSON-structured with consistent schema
 * - **Automatic Context**: Session ID, platform, and process info automatically included
 * - **Child Loggers**: Create loggers that inherit parent context
 * - **Multiple Transports**: Route logs to console, files, or custom destinations
 * - **Custom Formatters**: Control log output format
 * - **Error Serialization**: Automatic Error object serialization with stack traces
 *
 * Log Entry Structure:
 * ```json
 * {
 *   "timestamp": "2025-01-02T10:30:00.000Z",
 *   "level": "info",
 *   "message": "User logged in",
 *   "namespace": "user-service",
 *   "context": {
 *     "sessionId": "abc123",
 *     "platform": "desktop",
 *     "userId": "123"
 *   },
 *   "data": { "additionalData": "here" },
 *   "error": { "name": "Error", "message": "...", "stack": "..." }
 * }
 * ```
 *
 * @see {@link createLogger} for the recommended way to create instances
 * @see {@link createLoggerSync} for synchronous instance creation
 * @see {@link IStructuredLogger} for the interface definition
 *
 * @since 1.0.0
 */
export class StructuredLogger implements IStructuredLogger {
  private baseLogger: log.Logger;
  private globalContext: Partial<LogContext> = {};
  private sessionId: string;
  private namespace: string;
  private formatter?: Formatter;
  private transports: Transport[] = [];

  constructor(
    private deviceInfo: DeviceInfoInterface,
    private cryptoUtils: CryptoUtilsInterface,
    config: LogConfig = {},
  ) {
    this.namespace = config.namespace || "app";
    this.baseLogger = log.getLogger(this.namespace);
    this.sessionId = this.cryptoUtils.generateId();

    // Set up initial log level
    if (config.level) {
      this.setLevel(config.level);
    }

    // Set up default context
    if (config.context) {
      this.globalContext = { ...config.context };
    }

    // Add session info to global context
    this.globalContext.sessionId = this.sessionId;

    // Initialize platform info - will be set asynchronously
    this.initializePlatformInfo();

    // Set up formatter
    if (config.formatter) {
      this.setFormatter(config.formatter);
    }

    // Set up transports
    if (config.transports) {
      config.transports.forEach((transport) => this.addTransport(transport));
    }
  }

  /**
   * Initialize platform information asynchronously.
   * Called during construction to set platform context.
   */
  private async initializePlatformInfo(): Promise<void> {
    try {
      const deviceContext = await this.deviceInfo.getDeviceInfo();

      // Update global context with device information
      if (deviceContext.platform) {
        this.globalContext.platform = deviceContext.platform;
      }

      if (deviceContext.deviceInfo) {
        this.globalContext.deviceInfo = deviceContext.deviceInfo;
      }
    } catch (error) {
      // Log device info gathering failure but don't fail logger creation
      console.warn("Failed to gather device info:", error);
      this.globalContext.platform = undefined;
    }
  }

  /**
   * Sets the minimum log level for this logger.
   *
   * @param level - The minimum level to log ('trace', 'debug', 'info', 'warn', 'error')
   *
   * @example
   * ```typescript
   * logger.setLevel('debug');  // Will log debug, info, warn, error
   * logger.setLevel('error');  // Will only log error messages
   * ```
   */
  setLevel(level: LogLevelNames): void {
    this.baseLogger.setLevel(level);
  }

  /**
   * Gets the current minimum log level for this logger.
   *
   * @returns The current log level
   *
   * @example
   * ```typescript
   * const level = logger.getLevel(); // 'info'
   * ```
   */
  getLevel(): LogLevelNames {
    const level = this.baseLogger.getLevel();
    const levelMap: Record<number, LogLevelNames> = {
      0: "trace",
      1: "debug",
      2: "info",
      3: "warn",
      4: "error",
    };
    return levelMap[level] || "info";
  }

  /**
   * Logs a trace-level message. Trace is the most verbose level, typically used for
   * detailed diagnostic information.
   *
   * @param message - The log message
   * @param data - Optional additional data to include in the log entry
   *
   * @example
   * ```typescript
   * logger.trace('Entering function', { functionName: 'processUser', args: [userId] });
   * ```
   */
  trace(message: string, data?: Record<string, unknown>): void {
    this.log("trace", message, data);
  }

  /**
   * Logs a debug-level message. Used for diagnostic information useful during development.
   *
   * @param message - The log message
   * @param data - Optional additional data to include in the log entry
   *
   * @example
   * ```typescript
   * logger.debug('Cache hit', { key: 'user:123', ttl: 300 });
   * ```
   */
  debug(message: string, data?: Record<string, unknown>): void {
    this.log("debug", message, data);
  }

  /**
   * Logs an info-level message. Used for general application flow information.
   *
   * @param message - The log message
   * @param data - Optional additional data to include in the log entry
   *
   * @example
   * ```typescript
   * logger.info('User logged in', { userId: '123', loginMethod: 'oauth' });
   * ```
   */
  info(message: string, data?: Record<string, unknown>): void {
    this.log("info", message, data);
  }

  /**
   * Logs a warning-level message. Used for potentially harmful situations that
   * don't prevent the application from continuing.
   *
   * @param message - The log message
   * @param data - Optional additional data to include in the log entry
   *
   * @example
   * ```typescript
   * logger.warn('Rate limit approaching', { requestCount: 95, limit: 100 });
   * ```
   */
  warn(message: string, data?: Record<string, unknown>): void {
    this.log("warn", message, data);
  }

  /**
   * Logs an error-level message. Used for error conditions that might still allow
   * the application to continue running.
   *
   * @param message - The log message
   * @param error - Optional Error object or ErrorInfo for detailed error information
   * @param data - Optional additional data to include in the log entry
   *
   * @example
   * ```typescript
   * // With Error object
   * logger.error('Database connection failed', dbError, { retryCount: 3 });
   *
   * // With error info
   * logger.error('Validation failed', { name: 'ValidationError', message: 'Invalid email' });
   *
   * // Without error object
   * logger.error('Operation failed', undefined, { operation: 'deleteUser', userId: '123' });
   * ```
   */
  error(
    message: string,
    error?: Error | ErrorInfo,
    data?: Record<string, unknown>,
  ): void {
    let errorInfo: ErrorInfo | undefined;

    if (error) {
      if (error instanceof Error) {
        errorInfo = serializeError(error);
      } else {
        errorInfo = error;
      }
    }

    this.log("error", message, data, errorInfo);
  }

  /**
   * Logs a fatal-level message. Used for critical errors that might cause the
   * application to terminate. Note: internally mapped to 'error' level since
   * loglevel doesn't support 'fatal'.
   *
   * @param message - The log message
   * @param error - Optional Error object or ErrorInfo for detailed error information
   * @param data - Optional additional data to include in the log entry
   *
   * @example
   * ```typescript
   * logger.fatal('Database connection completely lost', dbError, {
   *   connectionPool: 'exhausted',
   *   timeToRestart: 'immediate'
   * });
   * ```
   */
  fatal(
    message: string,
    error?: Error | ErrorInfo,
    data?: Record<string, unknown>,
  ): void {
    let errorInfo: ErrorInfo | undefined;

    if (error) {
      if (error instanceof Error) {
        errorInfo = serializeError(error);
      } else {
        errorInfo = error;
      }
    }

    // Use "error" level for fatal since loglevel doesn't support "fatal"
    this.log("error", message, data, errorInfo);
  }

  private log(
    level: LogLevelNames,
    message: string,
    data?: Record<string, unknown>,
    error?: ErrorInfo,
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      namespace: this.namespace,
      context: this.globalContext,
      data,
      error,
    };

    // Send to all transports
    this.transports.forEach((transport) => {
      try {
        // Check if transport should handle this entry
        if (!transport.shouldLog || transport.shouldLog(entry)) {
          // Apply formatter and write to transport
          let formatted: string;
          if (this.formatter) {
            const formatterResult = this.formatter.format(entry);
            formatted =
              typeof formatterResult === "string"
                ? formatterResult
                : JSON.stringify(formatterResult);
          } else {
            formatted = JSON.stringify(entry);
          }
          transport.write(formatted);
        }
      } catch (transportError) {
        // Log transport errors to console as fallback
        console.error("Transport error:", transportError);
      }
    });

    // Fallback to console if no transports configured
    if (this.transports.length === 0) {
      this.logToConsole(level, message, data, error);
    }
  }

  private logToConsole(
    level: LogLevelNames,
    message: string,
    data?: Record<string, unknown>,
    error?: ErrorInfo,
  ): void {
    const logMethod = this.baseLogger[level];
    if (typeof logMethod === "function") {
      const contextData = {
        ...this.globalContext,
        ...data,
        ...(error && { error }),
      };
      logMethod.call(this.baseLogger, message, contextData);
    }
  }

  /**
   * Creates a child logger that inherits the parent's configuration and adds
   * additional context. Child loggers are useful for adding component-specific
   * or request-specific context without affecting the parent logger.
   *
   * @param context - Additional context to add to all log entries from this child logger
   * @returns A new StructuredLogger instance with combined context
   *
   * @example
   * ```typescript
   * // Parent logger
   * const logger = await createLogger({ config: { name: 'api-server' } });
   *
   * // Child logger for specific request
   * const requestLogger = logger.child({
   *   requestId: 'req-123',
   *   userId: '456',
   *   component: 'auth-handler'
   * });
   *
   * // Child logger inherits parent config + adds new context
   * requestLogger.info('Processing login request');
   * // Logs with: sessionId, platform (from parent) + requestId, userId, component (from child)
   *
   * // Nested child loggers
   * const validationLogger = requestLogger.child({ step: 'validation' });
   * validationLogger.debug('Validating credentials');
   * ```
   *
   * @remarks
   * - Child loggers inherit the parent's log level, formatter, and transports
   * - Child context is merged with parent context (child values take precedence)
   * - Each child gets its own session ID but inherits platform detection
   * - Changes to child logger don't affect parent or sibling loggers
   */
  child(context: Partial<LogContext>): StructuredLogger {
    const childLogger = new StructuredLogger(
      this.deviceInfo,
      this.cryptoUtils,
      {
        namespace: this.namespace,
        formatter: this.formatter,
        transports: [...this.transports],
      },
    );

    // Inherit parent's log level
    childLogger.setLevel(this.getLevel());

    // Set child-specific context without affecting parent
    childLogger.globalContext = {
      ...childLogger.globalContext, // Keep sessionId and platform from child
      ...context,
    };

    return childLogger;
  }

  /**
   * Adds a transport to this logger instance. Transports determine where
   * log messages are sent (console, file, external service, etc.).
   *
   * @param transport - The transport instance to add
   *
   * @example
   * ```typescript
   * import { ConsoleTransport, FileTransport } from '@fishbowl-ai/shared/logging';
   *
   * // Add console transport
   * logger.addTransport(new ConsoleTransport({ colorize: true }));
   *
   * // Add file transport
   * logger.addTransport(new FileTransport({ filename: 'app.log' }));
   * ```
   */
  addTransport(transport: Transport): void {
    this.transports.push(transport);
  }

  /**
   * Removes a transport from this logger instance.
   *
   * @param transport - The transport instance to remove
   *
   * @example
   * ```typescript
   * logger.removeTransport(consoleTransport);
   * ```
   */
  removeTransport(transport: Transport): void {
    const index = this.transports.indexOf(transport);
    if (index > -1) {
      this.transports.splice(index, 1);
    }
  }

  /**
   * Sets the formatter for this logger instance. The formatter controls
   * how log entries are serialized before being sent to transports.
   *
   * @param formatter - The formatter instance to use
   *
   * @example
   * ```typescript
   * import { SimpleFormatter, ConsoleFormatter } from '@fishbowl-ai/shared/logging';
   *
   * // Use simple JSON formatter
   * logger.setFormatter(new SimpleFormatter());
   *
   * // Use console formatter with colors
   * logger.setFormatter(new ConsoleFormatter({ colorize: true }));
   * ```
   */
  setFormatter(formatter: Formatter): void {
    this.formatter = formatter;
  }
}
