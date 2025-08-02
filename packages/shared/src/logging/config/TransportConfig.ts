import type { LogFilterConfig } from "./LogFilterConfig";

export interface TransportConfig {
  type: "console" | "file" | "custom";
  formatter?: "simple" | "console" | "json" | "custom";
  formatterOptions?: Record<string, unknown>;
  level?: string;
  filters?: LogFilterConfig[];
  // File transport specific
  filePath?: string;
  maxFileSize?: number;
  maxFiles?: number;
}
