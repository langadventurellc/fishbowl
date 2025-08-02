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
import { detectPlatform } from "./utils/detectPlatform";
import { serializeError } from "./utils/errorSerializer";

/**
 * Generates a random session ID without external dependencies
 */
function generateSessionId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

/**
 * Core StructuredLogger implementation that provides structured logging capabilities
 * with context management, formatters, and transports.
 */
export class StructuredLogger implements IStructuredLogger {
  private baseLogger: log.Logger;
  private globalContext: Partial<LogContext> = {};
  private sessionId: string;
  private namespace: string;
  private formatter?: Formatter;
  private transports: Transport[] = [];

  constructor(config: LogConfig = {}) {
    this.namespace = config.namespace || "app";
    this.baseLogger = log.getLogger(this.namespace);
    this.sessionId = generateSessionId();

    // Set up initial log level
    if (config.level) {
      this.setLevel(config.level);
    }

    // Set up default context
    if (config.context) {
      this.globalContext = { ...config.context };
    }

    // Add session and platform info to global context
    this.globalContext.sessionId = this.sessionId;
    const platformInfo = detectPlatform();
    this.globalContext.platform = platformInfo.isReactNative
      ? "mobile"
      : "desktop";

    // Set up formatter
    if (config.formatter) {
      this.setFormatter(config.formatter);
    }

    // Set up transports
    if (config.transports) {
      config.transports.forEach((transport) => this.addTransport(transport));
    }
  }

  setLevel(level: LogLevelNames): void {
    this.baseLogger.setLevel(level);
  }

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

  trace(message: string, data?: Record<string, unknown>): void {
    this.log("trace", message, data);
  }

  debug(message: string, data?: Record<string, unknown>): void {
    this.log("debug", message, data);
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.log("info", message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.log("warn", message, data);
  }

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

  child(context: Partial<LogContext>): StructuredLogger {
    const childLogger = new StructuredLogger({
      namespace: this.namespace,
      formatter: this.formatter,
      transports: [...this.transports],
    });

    // Inherit parent's log level
    childLogger.setLevel(this.getLevel());

    // Set child-specific context without affecting parent
    childLogger.globalContext = {
      ...childLogger.globalContext, // Keep sessionId and platform from child
      ...context,
    };

    return childLogger;
  }

  addTransport(transport: Transport): void {
    this.transports.push(transport);
  }

  removeTransport(transport: Transport): void {
    const index = this.transports.indexOf(transport);
    if (index > -1) {
      this.transports.splice(index, 1);
    }
  }

  setFormatter(formatter: Formatter): void {
    this.formatter = formatter;
  }
}
