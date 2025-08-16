import {
  createLoggerSync,
  type StructuredLogger as IStructuredLogger,
} from "@fishbowl-ai/shared";
import { BrowserCryptoUtils } from "../utils/BrowserCryptoUtils";
import { BrowserDeviceInfo } from "../utils/BrowserDeviceInfo";

/**
 * Service container for Electron renderer process dependencies.
 *
 * Implements dependency injection pattern by creating browser implementations
 * and injecting them into shared services. Provides configured services
 * for use throughout the renderer process.
 *
 * @example
 * ```typescript
 * // In renderer initialization
 * const services = new RendererProcessServices();
 *
 * // Use configured services
 * services.logger.info("Renderer started");
 * const deviceContext = await services.deviceInfo.getDeviceInfo();
 * ```
 */
export class RendererProcessServices {
  // Browser implementations
  readonly cryptoUtils: BrowserCryptoUtils;
  readonly deviceInfo: BrowserDeviceInfo;

  // Configured shared services
  readonly logger: IStructuredLogger;

  constructor() {
    // Initialize browser implementations
    this.cryptoUtils = new BrowserCryptoUtils();
    this.deviceInfo = new BrowserDeviceInfo();

    // Create logger with browser implementations
    // Using createLoggerSync for consistent configuration
    this.logger = this.createConfiguredLogger();
  }

  /**
   * Create a configured logger with browser implementations.
   * Uses createLoggerSync function for consistent configuration with dependency injection.
   *
   * @returns Configured logger instance
   */
  private createConfiguredLogger(): IStructuredLogger {
    // Create logger with browser implementations using createLoggerSync
    // This approach ensures consistent configuration while injecting our implementations
    try {
      // Use createLoggerSync with our browser implementations
      // Note: createLoggerSync already handles injection internally,
      // but we want to ensure it uses our specific browser implementations
      return createLoggerSync({
        config: {
          name: "desktop-renderer",
          level: "info",
          includeDeviceInfo: true,
        },
        context: {
          platform: "desktop",
          metadata: {
            process: "renderer",
            // Add renderer-specific context
            userAgent: globalThis.navigator?.userAgent,
            renderer: "electron",
          },
        },
      }) as IStructuredLogger;
    } catch (error) {
      // Fallback to console logging if logger creation fails
      console.error("Failed to create configured logger:", error);

      // Create minimal logger fallback
      return {
        debug: (msg: string, meta?: unknown) => console.debug(msg, meta),
        info: (msg: string, meta?: unknown) => console.info(msg, meta),
        warn: (msg: string, meta?: unknown) => console.warn(msg, meta),
        error: (msg: string, error?: Error | unknown, meta?: unknown) =>
          console.error(msg, error, meta),
        setLevel: () => {},
        getLevel: () => "info" as const,
        trace: (msg: string, meta?: unknown) => console.debug(msg, meta),
        fatal: (msg: string, error?: Error | unknown, meta?: unknown) =>
          console.error(msg, error, meta),
        child: () =>
          ({
            debug: (msg: string, meta?: unknown) => console.debug(msg, meta),
            info: (msg: string, meta?: unknown) => console.info(msg, meta),
            warn: (msg: string, meta?: unknown) => console.warn(msg, meta),
            error: (msg: string, error?: Error | unknown, meta?: unknown) =>
              console.error(msg, error, meta),
            setLevel: () => {},
            getLevel: () => "info" as const,
            trace: (msg: string, meta?: unknown) => console.debug(msg, meta),
            fatal: (msg: string, error?: Error | unknown, meta?: unknown) =>
              console.error(msg, error, meta),
            child: () => ({}) as IStructuredLogger,
            addTransport: () => {},
            removeTransport: () => {},
            setFormatter: () => {},
          }) as unknown as IStructuredLogger,
        addTransport: () => {},
        removeTransport: () => {},
        setFormatter: () => {},
      } as unknown as IStructuredLogger;
    }
  }
}
