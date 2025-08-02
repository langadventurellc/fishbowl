import type { LoggerConfig } from "./LogConfig";

export interface LogConfigValidator {
  validate(config: LoggerConfig): { valid: boolean; errors?: string[] };
}
