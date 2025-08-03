import type { LogEntry } from "./LogEntry";

/**
 * Log transport interface
 */
export interface Transport {
  /** Unique identifier for the transport */
  name: string;
  /** Write a formatted log entry */
  write(formattedEntry: string | Record<string, unknown>): void | Promise<void>;
  /** Optional filter to determine if this transport should handle the entry */
  shouldLog?(entry: LogEntry): boolean;
}
