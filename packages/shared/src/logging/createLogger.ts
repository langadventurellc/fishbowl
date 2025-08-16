import { StructuredLogger } from "./StructuredLogger";
import type {
  LogContext,
  StructuredLogger as IStructuredLogger,
  Transport,
  LogConfig,
} from "./types";
import type { CreateLoggerOptions } from "./CreateLoggerOptions";
import type { DeviceInfoInterface } from "./DeviceInfoInterface";
import type { CryptoUtilsInterface } from "../utils/CryptoUtilsInterface";
import { ConsoleTransport } from "./transports/ConsoleTransport";
import { SimpleFormatter } from "./formatters";
import { getDefaultConfig, mergeConfig } from "./config";
import { convertLogLevel } from "./convertLogLevel";
import { createTransport } from "./createTransport";

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
  deviceInfo: DeviceInfoInterface,
  cryptoUtils: CryptoUtilsInterface,
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
      const deviceContext = await deviceInfo.getDeviceInfo();
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

  // Platform-agnostic logger - process info provided via injected device info

  // Convert LoggerConfig to LogConfig for StructuredLogger
  const logConfig: LogConfig = {
    level: convertLogLevel(config.level),
    namespace: config.name,
    context,
    transports,
  };

  // Create and return the logger with injected implementations
  return new StructuredLogger(deviceInfo, cryptoUtils, logConfig);
}
