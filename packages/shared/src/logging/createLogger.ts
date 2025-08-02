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
import { getDeviceInfo } from "./utils/getDeviceInfo";
import { convertLogLevel } from "./convertLogLevel";
import { createTransport } from "./createTransport";

/**
 * Creates a structured logger with async device info gathering
 */
export async function createLogger(
  options: CreateLoggerOptions = {},
): Promise<IStructuredLogger> {
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

  // Build initial context
  let context: LogContext = {
    ...options.context,
  };

  // Add global context if provided
  if (config.globalContext) {
    Object.assign(context, {
      metadata: { ...context.metadata, ...config.globalContext },
    });
  }

  // Add device info if enabled
  if (config.includeDeviceInfo) {
    try {
      const deviceContext = await getDeviceInfo();
      if (deviceContext.deviceInfo) {
        context.deviceInfo = deviceContext.deviceInfo;
      }
      if (deviceContext.platform) {
        context.platform = deviceContext.platform;
      }
    } catch (error) {
      // Log device info gathering failure but don't fail logger creation
      console.warn("Failed to gather device info:", error);
    }
  }

  // Add metadata for process info
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
