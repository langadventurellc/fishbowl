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
import { getByteLength } from "../utils/getByteLength";

/**
 * Creates a structured logger with comprehensive context and async device info gathering.
 *
 * This is the recommended way to create loggers in the Fishbowl application as it provides
 * the most complete context information including device info, platform detection, and
 * process metadata.
 *
 * @example
 * ```typescript
 * // Basic usage
 * const logger = await createLogger();
 * logger.info('Hello world');
 *
 * // With configuration
 * const logger = await createLogger({
 *   config: {
 *     name: 'user-service',
 *     level: 'debug',
 *     includeDeviceInfo: true
 *   }
 * });
 *
 * // With custom context
 * const logger = await createLogger({
 *   context: {
 *     userId: '123',
 *     requestId: 'req-456'
 *   }
 * });
 *
 * // Create child logger with additional context
 * const childLogger = logger.child({ component: 'auth' });
 * childLogger.info('User login attempt', { email: 'user@example.com' });
 * ```
 *
 * @param options - Configuration options for the logger
 * @param options.config - Logger configuration including name, level, transports
 * @param options.context - Initial context data to include with all log entries
 *
 * @returns Promise that resolves to a configured StructuredLogger instance
 *
 * @throws Will log warnings (not throw) if device info gathering fails
 *
 * @see {@link createLoggerSync} for synchronous logger creation
 * @see {@link StructuredLogger} for the logger interface documentation
 *
 * @since 1.0.0
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

  // Create default device info implementation for logger injection
  const deviceInfo = {
    getDeviceInfo: async () => await getDeviceInfo(),
  };

  // Create default crypto utils implementation for logger injection
  const cryptoUtils = {
    randomBytes: async (size: number): Promise<Uint8Array> => {
      const { randomBytes: nodeRandomBytes } = await import("crypto");
      return new Uint8Array(nodeRandomBytes(size));
    },
    generateId: (): string => {
      return (
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
      );
    },
    getByteLength: async (str: string): Promise<number> => {
      return await getByteLength(str);
    },
  };

  // Create and return the logger with injected implementations
  return new StructuredLogger(deviceInfo, cryptoUtils, logConfig);
}
