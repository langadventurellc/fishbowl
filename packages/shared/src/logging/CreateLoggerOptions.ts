import type { LogContext } from "./types";
import type { LoggerConfig } from "./config/LogConfig";

export interface CreateLoggerOptions {
  config?: Partial<LoggerConfig>;
  context?: LogContext;
}
