---
kind: task
id: T-implement-createlogger-factory
title: Implement createLogger factory function and main exports with unit tests
status: open
priority: normal
prerequisites:
  - T-implement-structuredlogger-core
  - T-create-consoleformatter-and
  - T-create-configuration-system-with
  - T-create-device-info-utility-with
created: "2025-08-02T11:53:55.313085"
updated: "2025-08-02T11:53:55.313085"
schema_version: "1.1"
---

## Implement createLogger factory function and main exports with unit tests

### Context

Create the main factory function that ties together all the logging components and provides the primary API for creating configured loggers. This includes setting up transports, formatters, and device info based on configuration.

### Implementation Requirements

1. Create the createLogger factory function
2. Wire up all components based on configuration
3. Initialize transports and formatters
4. Optionally gather and include device info
5. Create main barrel exports for the logging package
6. Write comprehensive unit tests

### Technical Approach

#### File: packages/shared/src/logging/createLogger.ts

```typescript
import { StructuredLogger } from "./StructuredLogger";
import { ConsoleTransport } from "./transports/ConsoleTransport";
import {
  ConsoleFormatter,
  SimpleFormatter,
} from "./formatters/ConsoleFormatter";
import { getDeviceInfo } from "./utils/deviceInfo";
import { getDefaultConfig, mergeConfig, defaultValidator } from "./config";
import type {
  LogConfig,
  StructuredLogger as IStructuredLogger,
  Formatter,
  Transport,
} from "./types";

export interface CreateLoggerOptions extends Partial<LogConfig> {
  skipValidation?: boolean;
}

export async function createLogger(
  options: CreateLoggerOptions = {},
): Promise<IStructuredLogger> {
  // Get default config for current environment
  const defaultConfig = getDefaultConfig();

  // Merge with user options
  const config = mergeConfig(defaultConfig, options);

  // Validate configuration unless skipped
  if (!options.skipValidation) {
    const validation = defaultValidator.validate(config);
    if (!validation.valid) {
      throw new Error(
        `Invalid logger configuration: ${validation.errors?.join(", ")}`,
      );
    }
  }

  // Create the logger instance
  const logger = new StructuredLogger(config);

  // Set up transports
  if (config.transports) {
    for (const transportConfig of config.transports) {
      const transport = createTransport(transportConfig);
      if (transport) {
        logger.addTransport(transport);
      }
    }
  }

  // Set global context if provided
  if (config.globalContext) {
    logger.setContext(config.globalContext);
  }

  // Add device info if enabled
  if (config.includeDeviceInfo) {
    try {
      const deviceInfo = await getDeviceInfo();
      logger.setContext({ device: deviceInfo });
    } catch (error) {
      // Log device info error but don't fail logger creation
      logger.warn("Failed to gather device info", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return logger;
}

export function createLoggerSync(
  options: CreateLoggerOptions = {},
): IStructuredLogger {
  // Get default config for current environment
  const defaultConfig = getDefaultConfig();

  // Merge with user options
  const config = mergeConfig(defaultConfig, options);

  // Validate configuration unless skipped
  if (!options.skipValidation) {
    const validation = defaultValidator.validate(config);
    if (!validation.valid) {
      throw new Error(
        `Invalid logger configuration: ${validation.errors?.join(", ")}`,
      );
    }
  }

  // Create the logger instance
  const logger = new StructuredLogger(config);

  // Set up transports
  if (config.transports) {
    for (const transportConfig of config.transports) {
      const transport = createTransport(transportConfig);
      if (transport) {
        logger.addTransport(transport);
      }
    }
  }

  // Set global context if provided
  if (config.globalContext) {
    logger.setContext(config.globalContext);
  }

  // Note: Device info is not gathered in sync version
  if (config.includeDeviceInfo) {
    // Schedule async device info gathering
    getDeviceInfo()
      .then((deviceInfo) => {
        logger.setContext({ device: deviceInfo });
      })
      .catch((error) => {
        logger.warn("Failed to gather device info", {
          error: error instanceof Error ? error.message : String(error),
        });
      });
  }

  return logger;
}

function createTransport(config: any): Transport | null {
  switch (config.type) {
    case "console":
      const formatter = createFormatter(
        config.formatter,
        config.formatterOptions,
      );
      return new ConsoleTransport({
        formatter,
        minLevel: config.level,
      });

    case "file":
      // File transport would be implemented separately
      // For now, log a warning and skip
      console.warn("File transport not yet implemented");
      return null;

    case "custom":
      // Custom transports would need to be passed in somehow
      console.warn("Custom transport requires implementation");
      return null;

    default:
      console.warn(`Unknown transport type: ${config.type}`);
      return null;
  }
}

function createFormatter(type?: string, options?: any): Formatter {
  switch (type) {
    case "simple":
      return new SimpleFormatter();

    case "console":
      return new ConsoleFormatter(options);

    case "json":
      // JSON formatter would be implemented separately
      // For now, use simple formatter
      return new SimpleFormatter();

    case "custom":
      // Custom formatters would need to be passed in somehow
      return new SimpleFormatter();

    default:
      return new SimpleFormatter();
  }
}
```

#### File: packages/shared/src/logging/index.ts (main exports)

```typescript
// Main factory functions
export { createLogger, createLoggerSync } from "./createLogger";
export type { CreateLoggerOptions } from "./createLogger";

// Core logger
export { StructuredLogger } from "./StructuredLogger";

// Types
export type {
  LogContext,
  LogEntry,
  ErrorInfo,
  StructuredLogger as Logger,
  Formatter,
  Transport,
  LogConfig,
  TransportConfig,
  LogFilterConfig,
} from "./types";

// Formatters
export {
  ConsoleFormatter,
  SimpleFormatter,
} from "./formatters/ConsoleFormatter";
export type { ConsoleFormatterOptions } from "./formatters/ConsoleFormatter";

// Transports
export { ConsoleTransport } from "./transports/ConsoleTransport";
export type { ConsoleTransportOptions } from "./transports/ConsoleTransport";

// Configuration
export {
  getDefaultConfig,
  mergeConfig,
  productionConfig,
  developmentConfig,
  testConfig,
  ConfigValidator,
  defaultValidator,
} from "./config";

// Utilities
export { detectPlatform, getDeviceInfo, serializeError } from "./utils";
export type { Platform } from "./utils";
```

#### File: packages/shared/src/logging/**tests**/createLogger.test.ts

```typescript
import { createLogger, createLoggerSync } from "../createLogger";
import { StructuredLogger } from "../StructuredLogger";
import type { LogEntry } from "../types";

// Mock dependencies
jest.mock("../utils/deviceInfo", () => ({
  getDeviceInfo: jest.fn().mockResolvedValue({
    platform: "test",
    version: "1.0.0",
  }),
}));

jest.mock("../config", () => ({
  ...jest.requireActual("../config"),
  getDefaultConfig: jest.fn().mockReturnValue({
    name: "test",
    level: "info",
    transports: [{ type: "console", formatter: "simple" }],
  }),
}));

describe("createLogger", () => {
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("async createLogger", () => {
    it("should create a logger with default config", async () => {
      const logger = await createLogger();

      expect(logger).toBeInstanceOf(StructuredLogger);
      expect(logger.info).toBeDefined();
      expect(logger.error).toBeDefined();
    });

    it("should merge user options with defaults", async () => {
      const logger = await createLogger({
        name: "custom-logger",
        globalContext: { app: "test-app" },
      });

      expect(logger).toBeInstanceOf(StructuredLogger);
    });

    it("should include device info when enabled", async () => {
      const mockGetDeviceInfo = require("../utils/deviceInfo").getDeviceInfo;
      mockGetDeviceInfo.mockResolvedValueOnce({
        platform: "test",
        version: "2.0.0",
      });

      const logger = await createLogger({
        includeDeviceInfo: true,
      });

      // Device info should be added to context
      expect(mockGetDeviceInfo).toHaveBeenCalled();
    });

    it("should handle device info errors gracefully", async () => {
      const mockGetDeviceInfo = require("../utils/deviceInfo").getDeviceInfo;
      mockGetDeviceInfo.mockRejectedValueOnce(new Error("Device info error"));

      const logger = await createLogger({
        includeDeviceInfo: true,
      });

      expect(logger).toBeInstanceOf(StructuredLogger);
      // Should not throw
    });

    it("should validate configuration by default", async () => {
      await expect(
        createLogger({
          level: "invalid" as any,
        }),
      ).rejects.toThrow("Invalid logger configuration");
    });

    it("should skip validation when requested", async () => {
      const logger = await createLogger({
        level: "invalid" as any,
        skipValidation: true,
      });

      expect(logger).toBeInstanceOf(StructuredLogger);
    });

    it("should create console transport", async () => {
      const logger = await createLogger({
        transports: [
          {
            type: "console",
            formatter: "console",
            formatterOptions: { prettyPrint: true },
          },
        ],
      });

      expect(logger).toBeInstanceOf(StructuredLogger);
    });

    it("should warn about unimplemented transports", async () => {
      await createLogger({
        transports: [
          { type: "file", filePath: "/logs/app.log" },
          { type: "custom" },
          { type: "unknown" as any },
        ],
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "File transport not yet implemented",
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Custom transport requires implementation",
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Unknown transport type: unknown",
      );
    });
  });

  describe("sync createLoggerSync", () => {
    it("should create a logger synchronously", () => {
      const logger = createLoggerSync();

      expect(logger).toBeInstanceOf(StructuredLogger);
      expect(logger.info).toBeDefined();
    });

    it("should schedule device info gathering asynchronously", async () => {
      const mockGetDeviceInfo = require("../utils/deviceInfo").getDeviceInfo;
      mockGetDeviceInfo.mockResolvedValueOnce({
        platform: "test-sync",
        version: "3.0.0",
      });

      const logger = createLoggerSync({
        includeDeviceInfo: true,
      });

      expect(logger).toBeInstanceOf(StructuredLogger);

      // Wait for async device info to be gathered
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockGetDeviceInfo).toHaveBeenCalled();
    });

    it("should handle async device info errors", async () => {
      const mockGetDeviceInfo = require("../utils/deviceInfo").getDeviceInfo;
      mockGetDeviceInfo.mockRejectedValueOnce(new Error("Async error"));

      const logger = createLoggerSync({
        includeDeviceInfo: true,
      });

      expect(logger).toBeInstanceOf(StructuredLogger);

      // Wait for async error to be handled
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Should not throw
    });

    it("should validate configuration", () => {
      expect(() =>
        createLoggerSync({
          transports: [{ type: "invalid" as any }],
        }),
      ).toThrow("Invalid logger configuration");
    });
  });

  describe("formatter creation", () => {
    it("should create different formatter types", async () => {
      const configs = [
        { formatter: "simple" },
        { formatter: "console", formatterOptions: { colorize: true } },
        { formatter: "json" }, // Falls back to simple
        { formatter: "custom" }, // Falls back to simple
        { formatter: undefined }, // Defaults to simple
      ];

      for (const transportConfig of configs) {
        const logger = await createLogger({
          transports: [{ type: "console", ...transportConfig }],
        });
        expect(logger).toBeInstanceOf(StructuredLogger);
      }
    });
  });
});
```

#### File: packages/shared/src/logging/**tests**/index.test.ts

```typescript
import * as LoggingExports from "../index";

describe("logging package exports", () => {
  it("should export factory functions", () => {
    expect(LoggingExports.createLogger).toBeDefined();
    expect(LoggingExports.createLoggerSync).toBeDefined();
  });

  it("should export core logger class", () => {
    expect(LoggingExports.StructuredLogger).toBeDefined();
  });

  it("should export formatters", () => {
    expect(LoggingExports.ConsoleFormatter).toBeDefined();
    expect(LoggingExports.SimpleFormatter).toBeDefined();
  });

  it("should export transports", () => {
    expect(LoggingExports.ConsoleTransport).toBeDefined();
  });

  it("should export configuration utilities", () => {
    expect(LoggingExports.getDefaultConfig).toBeDefined();
    expect(LoggingExports.mergeConfig).toBeDefined();
    expect(LoggingExports.productionConfig).toBeDefined();
    expect(LoggingExports.developmentConfig).toBeDefined();
    expect(LoggingExports.testConfig).toBeDefined();
    expect(LoggingExports.ConfigValidator).toBeDefined();
    expect(LoggingExports.defaultValidator).toBeDefined();
  });

  it("should export utilities", () => {
    expect(LoggingExports.detectPlatform).toBeDefined();
    expect(LoggingExports.getDeviceInfo).toBeDefined();
    expect(LoggingExports.serializeError).toBeDefined();
  });
});
```

### Acceptance Criteria

- [ ] createLogger factory function creates configured logger instances
- [ ] Async version properly waits for device info gathering
- [ ] Sync version schedules device info gathering asynchronously
- [ ] Configuration validation works correctly
- [ ] Transports are created based on configuration
- [ ] Formatters are created with proper options
- [ ] Global context is set when provided
- [ ] All components are properly exported from main index
- [ ] Unit tests achieve 100% code coverage
- [ ] TypeScript compilation succeeds
- [ ] `pnpm quality` passes without issues

### Dependencies

- Requires all previous tasks to be completed
- Integrates all logging components

### Testing Requirements

- Test async and sync factory functions
- Test configuration merging and validation
- Test transport and formatter creation
- Test device info integration
- Test error handling scenarios
- Test all exports are available
- Verify TypeScript types are properly exported

### Log
