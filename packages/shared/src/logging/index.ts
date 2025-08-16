/**
 * @fileoverview Fishbowl Structured Logging System
 *
 * A comprehensive logging system for the Fishbowl monorepo that provides structured logging
 * with context management, multiple transports, formatters, and platform detection.
 *
 * ## Quick Start
 *
 * ```typescript
 * import { createLogger } from '@fishbowl-ai/shared/logging';
 *
 * // Create a logger (async - includes device info)
 * const logger = await createLogger({
 *   config: { name: 'my-app', level: 'info' }
 * });
 *
 * // Create a synchronous logger (faster startup)
 * const syncLogger = createLoggerSync({
 *   config: { name: 'my-app', level: 'info' }
 * });
 *
 * // Use the logger
 * logger.info('Application started', { userId: '123' });
 * logger.error('Database connection failed', dbError, { retryCount: 3 });
 * ```
 *
 * ## Key Features
 * - **Structured Logging**: JSON-formatted logs with consistent structure
 * - **Context Management**: Automatic session, device, and platform context
 * - **Multiple Transports**: Console, file, and custom transport support
 * - **Child Loggers**: Create loggers with inherited context
 * - **Platform Detection**: Automatic desktop/mobile platform detection
 * - **Type Safety**: Full TypeScript support with strict typing
 *
 * @author Fishbowl Development Team
 * @since 1.0.0
 */

// Main factory functions - these are the primary entry points for most developers
export { createLogger } from "./createLogger";
export { createLoggerSync } from "./createLoggerSync";
export type { CreateLoggerOptions } from "./CreateLoggerOptions";

// Re-export all types for advanced usage
export * from "./types";
export * from "./formatters";
export * from "./transports";
export * from "./utils";
export * from "./config";
export { StructuredLogger } from "./StructuredLogger";
export type { DeviceInfoInterface } from "./DeviceInfoInterface";
