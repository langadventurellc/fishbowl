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
 * Creates a structured logger synchronously without device info gathering.
 *
 * This function provides faster logger initialization by skipping async device info
 * collection. Use this when you need immediate logger availability or when device
 * info is not required for your use case.
 *
 * @example
 * ```typescript
 * // Basic synchronous logger
 * const logger = createLoggerSync();
 * logger.info('Application starting...');
 *
 * // With configuration
 * const logger = createLoggerSync({
 *   config: {
 *     name: 'startup-service',
 *     level: 'debug'
 *   }
 * });
 *
 * // For testing or development
 * const testLogger = createLoggerSync({
 *   config: {
 *     name: 'test',
 *     level: 'trace',
 *     includeDeviceInfo: false
 *   }
 * });
 *
 * // In error handlers where you need immediate logging
 * const errorLogger = createLoggerSync({
 *   context: { component: 'error-handler' }
 * });
 * errorLogger.error('Unhandled exception', error);
 * ```
 *
 * @param options - Configuration options for the logger
 * @param options.config - Logger configuration including name, level, transports
 * @param options.context - Initial context data to include with all log entries
 *
 * @returns A configured StructuredLogger instance (immediately available)
 *
 * @remarks
 * The sync version:
 * - Does not include device info (CPU, memory, etc.) in context
 * - Still includes process info (PID, platform, Node version)
 * - Still includes session ID and platform detection
 * - Is suitable for performance-critical startup paths
 *
 * @see {@link createLogger} for async logger creation with full device info
 * @see {@link StructuredLogger} for the logger interface documentation
 *
 * @since 1.0.0
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

  // Add metadata for process info (synchronous, with safe fallbacks for renderer)
  context = {
    ...context,
    metadata: {
      ...context.metadata,
      process: {
        pid: typeof process !== "undefined" ? process.pid : undefined,
        ppid: typeof process !== "undefined" ? process.ppid : undefined,
        version: typeof process !== "undefined" ? process.version : undefined,
        platform: typeof process !== "undefined" ? process.platform : "unknown",
        nodeVersion:
          typeof process !== "undefined" && process.versions
            ? process.versions.node
            : undefined,
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

  // Create default device info implementation (sync version)
  const deviceInfo = {
    getDeviceInfo: async () => ({
      platform: undefined,
      deviceInfo: {
        platform: "unknown",
        note: "Device info not available in sync logger",
      },
    }),
  };

  // Create default crypto utils implementation
  const cryptoUtils = {
    randomBytes: async (size: number): Promise<Uint8Array> => {
      // Fallback to Math.random for sync logger
      const bytes = new Uint8Array(size);
      for (let i = 0; i < size; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
      return bytes;
    },
    generateId: (): string => {
      return (
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
      );
    },
    getByteLength: async (str: string): Promise<number> => {
      // Simple fallback for sync logger
      return str.length;
    },
  };

  // Create and return the logger with injected implementations
  return new StructuredLogger(deviceInfo, cryptoUtils, logConfig);
}
