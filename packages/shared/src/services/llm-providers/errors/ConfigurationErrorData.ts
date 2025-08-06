import type { ConfigurationErrorContext } from "./ConfigurationErrorContext";

export interface ConfigurationErrorData {
  name: string;
  message: string;
  filePath: string;
  operation: string;
  context?: ConfigurationErrorContext;
  stack?: string;
  timestamp: string;
}
