import type { LogEntry } from "./LogEntry";

/**
 * Log formatter interface
 */
export interface Formatter {
  /** Format a log entry into a string or structured object */
  format(entry: LogEntry): string | Record<string, unknown>;
}
