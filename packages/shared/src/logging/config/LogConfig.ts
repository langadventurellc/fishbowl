import type { LogLevelDesc } from "loglevel";
import type { TransportConfig } from "./TransportConfig";

export interface LoggerConfig {
  name?: string;
  level?: LogLevelDesc;
  includeDeviceInfo?: boolean;
  transports?: TransportConfig[];
  globalContext?: Record<string, unknown>;
  // Performance options
  bufferSize?: number;
  flushInterval?: number;
}
