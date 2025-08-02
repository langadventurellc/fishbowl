import type { LogEntry } from "../types/LogEntry";

export interface LogFilterConfig {
  type: "level" | "pattern" | "custom";
  level?: string;
  pattern?: RegExp;
  filter?: (entry: LogEntry) => boolean;
}
