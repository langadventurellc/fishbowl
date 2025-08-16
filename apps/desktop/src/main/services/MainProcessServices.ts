import {
  FileStorageService,
  SettingsRepository,
  createLoggerSync,
  type StructuredLogger,
} from "@fishbowl-ai/shared";
import { NodeFileSystemBridge } from "./NodeFileSystemBridge";
import { NodeCryptoUtils } from "../utils/NodeCryptoUtils";
import { NodePathUtils } from "../utils/NodePathUtils";
import { NodeDeviceInfo } from "../utils/NodeDeviceInfo";

/**
 * Service container for Electron main process dependencies.
 *
 * Implements dependency injection pattern by creating Node.js implementations
 * and injecting them into shared services. Provides configured services
 * for use throughout the main process.
 *
 * @example
 * ```typescript
 * // In main.ts
 * const services = new MainProcessServices();
 *
 * // Use configured services
 * const settings = await services.settingsRepository.loadSettings();
 * services.logger.info("Application started");
 * ```
 */
export class MainProcessServices {
  // Node.js implementations
  readonly fileSystemBridge: NodeFileSystemBridge;
  readonly cryptoUtils: NodeCryptoUtils;
  readonly deviceInfo: NodeDeviceInfo;

  // Configured shared services
  readonly fileStorage: FileStorageService;
  readonly logger: StructuredLogger;

  constructor() {
    // Initialize Node.js implementations
    this.fileSystemBridge = new NodeFileSystemBridge();
    this.cryptoUtils = new NodeCryptoUtils();
    this.deviceInfo = new NodeDeviceInfo();
    const pathUtils = new NodePathUtils();

    // Create file storage service with Node.js file system bridge
    this.fileStorage = new FileStorageService(
      this.fileSystemBridge,
      this.cryptoUtils,
      pathUtils,
    );

    // Create logger with Node.js implementations
    // Using createLogger for consistent configuration
    this.logger = this.createConfiguredLogger();
  }

  /**
   * Create a SettingsRepository with the configured file storage service.
   *
   * @param settingsFilePath - Path to the settings file
   * @returns Configured SettingsRepository instance
   */
  createSettingsRepository(settingsFilePath: string): SettingsRepository {
    return new SettingsRepository(this.fileStorage, settingsFilePath);
  }

  /**
   * Create a configured logger with Node.js implementations.
   * Uses createLoggerSync function for consistent configuration with dependency injection.
   *
   * @returns Configured logger instance
   */
  private createConfiguredLogger(): StructuredLogger {
    // Create logger with Node.js implementations using createLoggerSync
    // This approach ensures consistent configuration while injecting our implementations
    try {
      // Use createLoggerSync with our Node implementations
      // Note: createLoggerSync already handles injection internally,
      // but we want to ensure it uses our specific Node implementations
      return createLoggerSync({
        config: {
          name: "desktop-main",
          level: "info",
          includeDeviceInfo: true,
        },
        context: {
          platform: "desktop",
          metadata: { process: "main", pid: process.pid },
        },
      }) as StructuredLogger;
    } catch (error) {
      // Fallback to console logging if logger creation fails
      console.error("Failed to create configured logger:", error);

      // Create minimal logger fallback
      return {
        debug: (msg: string, meta?: unknown) => console.debug(msg, meta),
        info: (msg: string, meta?: unknown) => console.info(msg, meta),
        warn: (msg: string, meta?: unknown) => console.warn(msg, meta),
        error: (msg: string, meta?: unknown) => console.error(msg, meta),
      } as StructuredLogger;
    }
  }
}
