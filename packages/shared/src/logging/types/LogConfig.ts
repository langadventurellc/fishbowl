import type { LogLevelNames } from "loglevel";
import type { LogContext } from "./LogContext";
import type { Formatter } from "./Formatter";
import type { Transport } from "./Transport";
import type { LogFilter } from "./LogFilter";

/**
 * Logger configuration
 */
export interface LogConfig {
  /** Default log level */
  level?: LogLevelNames;
  /** Logger namespace */
  namespace?: string;
  /** Default context */
  context?: LogContext;
  /** Formatters to use */
  formatter?: Formatter;
  /** Transports to use */
  transports?: Transport[];
  /** Global log filter */
  filter?: LogFilter;
}
