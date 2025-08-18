/**
 * Console-based implementation of the StructuredLogger interface.
 *
 * Provides a simple, dependency-free logger that outputs directly to the console.
 * Ideal for fallback scenarios, testing, or when platform-specific logging
 * implementations are unavailable.
 *
 * @module logging/ConsoleLogger
 */

import type { LogLevelNames } from "loglevel";
import type { StructuredLogger } from "./types/StructuredLogger";
import type { LogContext } from "./types/LogContext";
import type { ErrorInfo } from "./types/ErrorInfo";
import type { Transport } from "./types/Transport";
import type { Formatter } from "./types/Formatter";

/**
 * Console logger implementation that implements the StructuredLogger interface.
 *
 * Features:
 * - Direct console output with proper log level mapping
 * - Structured data formatting with JSON serialization
 * - Child logger support with context inheritance
 * - No-op transport and formatter methods (console-only)
 * - Error serialization for proper error logging
 *
 * @example
 * ```typescript
 * const logger = new ConsoleLogger();
 * logger.info('Application started', { version: '1.0.0' });
 *
 * const childLogger = logger.child({ component: 'auth' });
 * childLogger.warn('Token expiring soon', { expiresIn: 300 });
 * ```
 */
export class ConsoleLogger implements StructuredLogger {
  private currentLevel: LogLevelNames = "info";
  private context: Partial<LogContext> = {};

  constructor(initialContext: Partial<LogContext> = {}) {
    this.context = { ...initialContext };
  }

  /**
   * Sets the minimum log level for this logger.
   */
  setLevel(level: LogLevelNames): void {
    this.currentLevel = level;
  }

  /**
   * Gets the current minimum log level for this logger.
   */
  getLevel(): LogLevelNames {
    return this.currentLevel;
  }

  /**
   * Logs a trace-level message.
   */
  trace(message: string, data?: Record<string, unknown>): void {
    if (this.shouldLog("trace")) {
      this.logToConsole("trace", message, data);
    }
  }

  /**
   * Logs a debug-level message.
   */
  debug(message: string, data?: Record<string, unknown>): void {
    if (this.shouldLog("debug")) {
      this.logToConsole("debug", message, data);
    }
  }

  /**
   * Logs an info-level message.
   */
  info(message: string, data?: Record<string, unknown>): void {
    if (this.shouldLog("info")) {
      this.logToConsole("info", message, data);
    }
  }

  /**
   * Logs a warning-level message.
   */
  warn(message: string, data?: Record<string, unknown>): void {
    if (this.shouldLog("warn")) {
      this.logToConsole("warn", message, data);
    }
  }

  /**
   * Logs an error-level message.
   */
  error(
    message: string,
    error?: Error | ErrorInfo,
    data?: Record<string, unknown>,
  ): void {
    if (this.shouldLog("error")) {
      let errorInfo: ErrorInfo | undefined;

      if (error) {
        if (error instanceof Error) {
          errorInfo = {
            name: error.name,
            message: error.message,
            stack: error.stack,
          };
        } else {
          errorInfo = error;
        }
      }

      this.logToConsole("error", message, data, errorInfo);
    }
  }

  /**
   * Logs a fatal-level message.
   */
  fatal(
    message: string,
    error?: Error | ErrorInfo,
    data?: Record<string, unknown>,
  ): void {
    // Fatal maps to error level in console
    this.error(message, error, data);
  }

  /**
   * Creates a child logger that inherits the parent's configuration and adds
   * additional context.
   */
  child(context: Partial<LogContext>): StructuredLogger {
    const childLogger = new ConsoleLogger({
      ...this.context,
      ...context,
    });
    childLogger.setLevel(this.currentLevel);
    return childLogger;
  }

  /**
   * No-op method for transport compatibility.
   * Console logger outputs directly to console.
   */
  addTransport(_transport: Transport): void {
    // Console logger doesn't use transports - this is a no-op
  }

  /**
   * No-op method for transport compatibility.
   * Console logger outputs directly to console.
   */
  removeTransport(_transport: Transport): void {
    // Console logger doesn't use transports - this is a no-op
  }

  /**
   * No-op method for formatter compatibility.
   * Console logger uses built-in formatting.
   */
  setFormatter(_formatter: Formatter): void {
    // Console logger uses built-in formatting - this is a no-op
  }

  /**
   * Determines if a message should be logged based on current log level.
   */
  private shouldLog(level: LogLevelNames): boolean {
    const levels: Record<LogLevelNames, number> = {
      trace: 0,
      debug: 1,
      info: 2,
      warn: 3,
      error: 4,
    };

    return levels[level] >= levels[this.currentLevel];
  }

  /**
   * Internal method to output log messages to console.
   */
  private logToConsole(
    level: LogLevelNames,
    message: string,
    data?: Record<string, unknown>,
    error?: ErrorInfo,
  ): void {
    const timestamp = new Date().toISOString();
    const contextData = {
      timestamp,
      level: level.toUpperCase(),
      ...this.context,
      ...data,
      ...(error && { error }),
    };

    // Choose appropriate console method
    const consoleMethod = this.getConsoleMethod(level);

    // Format the output
    if (Object.keys(contextData).length > 2) {
      // More than just timestamp and level
      consoleMethod(`[${contextData.level}] ${message}`, contextData);
    } else {
      consoleMethod(`[${contextData.level}] ${message}`);
    }
  }

  /**
   * Maps log levels to appropriate console methods.
   */
  private getConsoleMethod(level: LogLevelNames): (...args: unknown[]) => void {
    switch (level) {
      case "trace":
      case "debug":
        return console.debug;
      case "info":
        return console.info;
      case "warn":
        return console.warn;
      case "error":
        return console.error;
      default:
        return console.log;
    }
  }
}
