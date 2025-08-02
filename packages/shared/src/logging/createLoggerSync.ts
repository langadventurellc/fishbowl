import { StructuredLogger } from "./StructuredLogger";
import type {
  LogContext,
  StructuredLogger as IStructuredLogger,
  Transport,
  LogConfig,
} from "./types";
import type { CreateLoggerOptions } from "./CreateLoggerOptions";
import { ConsoleTransport } from "./transports/ConsoleTransport";
import { SimpleFormatter } from "./formatters";
import { getDefaultConfig, mergeConfig } from "./config";
import { convertLogLevel } from "./convertLogLevel";
import { createTransport } from "./createTransport";

/**
 * Creates a structured logger synchronously (without device info gathering)
 */
export function createLoggerSync(
  options: CreateLoggerOptions = {},
): IStructuredLogger {
  // Get default config and merge with user options
  const defaultConfig = getDefaultConfig();
  const config = mergeConfig(defaultConfig, options.config || {});

  // Initialize transports based on configuration
  const transports: Transport[] = [];

  // Create transports from config
  if (config.transports) {
    for (const transportConfig of config.transports) {
      const transport = createTransport(transportConfig);
      if (transport) {
        transports.push(transport);
      }
    }
  } else {
    // Default to console transport if none specified
    const formatter = new SimpleFormatter();
    transports.push(new ConsoleTransport({ formatter }));
  }

  // Build initial context (skip device info in sync version)
  let context: LogContext = {
    ...options.context,
  };

  // Add global context if provided
  if (config.globalContext) {
    Object.assign(context, {
      metadata: { ...context.metadata, ...config.globalContext },
    });
  }

  // Add metadata for process info (synchronous)
  context = {
    ...context,
    metadata: {
      ...context.metadata,
      process: {
        pid: process.pid,
        ppid: process.ppid,
        version: process.version,
        platform: process.platform,
        nodeVersion: process.versions.node,
      },
    },
  };

  // Convert LoggerConfig to LogConfig for StructuredLogger
  const logConfig: LogConfig = {
    level: convertLogLevel(config.level),
    namespace: config.name,
    context,
    transports,
  };

  // Create and return the logger
  return new StructuredLogger(logConfig);
}
