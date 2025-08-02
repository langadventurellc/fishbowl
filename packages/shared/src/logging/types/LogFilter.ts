import type { LogEntry } from "./LogEntry";

/**
 * Log filter interface
 */
export interface LogFilter {
  /** Determine if a log entry should be processed */
  shouldLog(entry: LogEntry): boolean;
}
