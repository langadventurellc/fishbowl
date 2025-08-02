import type { LoggerConfig } from "./LogConfig";

export function mergeConfig(
  baseConfig: LoggerConfig,
  userConfig: Partial<LoggerConfig>,
): LoggerConfig {
  const merged: LoggerConfig = {
    ...baseConfig,
    ...userConfig,
  };

  // Deep merge transports if both exist
  if (baseConfig.transports && userConfig.transports) {
    merged.transports = userConfig.transports; // User config replaces base
  }

  // Deep merge globalContext
  if (baseConfig.globalContext || userConfig.globalContext) {
    merged.globalContext = {
      ...baseConfig.globalContext,
      ...userConfig.globalContext,
    };
  }

  return merged;
}
