import type { LogLevelNames } from "loglevel";
import type { LogContext } from "./LogContext";
import type { ErrorInfo } from "./ErrorInfo";

/**
 * Structured log entry
 */
export interface LogEntry {
  /** ISO timestamp of when the log was created */
  timestamp: string;
  /** Log level */
  level: LogLevelNames;
  /** Log message */
  message: string;
  /** Logger namespace/category */
  namespace: string;
  /** Associated context */
  context?: LogContext;
  /** Error information if applicable */
  error?: ErrorInfo;
  /** Additional data payload */
  data?: Record<string, unknown>;
}
