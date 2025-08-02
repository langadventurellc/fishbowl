import type { LogLevelNames } from "loglevel";
import type { LogContext } from "./LogContext";
import type { ErrorInfo } from "./ErrorInfo";
import type { Transport } from "./Transport";
import type { Formatter } from "./Formatter";

/**
 * Main structured logger interface
 */
export interface StructuredLogger {
  /** Set the log level */
  setLevel(level: LogLevelNames): void;
  /** Get current log level */
  getLevel(): LogLevelNames;
  /** Log a trace message */
  trace(message: string, data?: Record<string, unknown>): void;
  /** Log a debug message */
  debug(message: string, data?: Record<string, unknown>): void;
  /** Log an info message */
  info(message: string, data?: Record<string, unknown>): void;
  /** Log a warning message */
  warn(message: string, data?: Record<string, unknown>): void;
  /** Log an error message */
  error(
    message: string,
    error?: Error | ErrorInfo,
    data?: Record<string, unknown>,
  ): void;
  /** Log a fatal/critical message */
  fatal(
    message: string,
    error?: Error | ErrorInfo,
    data?: Record<string, unknown>,
  ): void;
  /** Create a child logger with additional context */
  child(context: Partial<LogContext>): StructuredLogger;
  /** Add a transport */
  addTransport(transport: Transport): void;
  /** Remove a transport */
  removeTransport(transport: Transport): void;
  /** Set the formatter */
  setFormatter(formatter: Formatter): void;
}
