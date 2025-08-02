---
kind: task
id: T-create-configuration-system-with
status: done
title: Create configuration system with defaults and unit tests
priority: normal
prerequisites:
  - T-create-logging-folder-structure
created: "2025-08-02T11:52:40.198140"
updated: "2025-08-02T12:57:22.019631"
schema_version: "1.1"
worktree: null
---

## Create configuration system with defaults and unit tests

### Context

Implement the configuration system that defines how the logging system is configured, including default settings for different environments. This provides a flexible way to configure loggers while maintaining sensible defaults.

### Implementation Requirements

1. Define configuration interfaces and types
2. Create default configuration for different environments
3. Support merging of user configuration with defaults
4. Validate configuration values
5. Write comprehensive unit tests

### Technical Approach

#### File: packages/shared/src/logging/config/LogConfig.ts

```typescript
import type { LogLevelDesc } from "loglevel";

export interface LogFilterConfig {
  type: "level" | "pattern" | "custom";
  level?: string;
  pattern?: RegExp;
  filter?: (entry: any) => boolean;
}

export interface TransportConfig {
  type: "console" | "file" | "custom";
  formatter?: "simple" | "console" | "json" | "custom";
  formatterOptions?: Record<string, any>;
  level?: string;
  filters?: LogFilterConfig[];
  // File transport specific
  filePath?: string;
  maxFileSize?: number;
  maxFiles?: number;
}

export interface LogConfig {
  name?: string;
  level?: LogLevelDesc;
  includeDeviceInfo?: boolean;
  transports?: TransportConfig[];
  globalContext?: Record<string, any>;
  // Performance options
  bufferSize?: number;
  flushInterval?: number;
}

export interface LogConfigValidator {
  validate(config: LogConfig): { valid: boolean; errors?: string[] };
}
```

#### File: packages/shared/src/logging/config/defaultConfig.ts

```typescript
import type { LogConfig } from "./LogConfig";

export const productionConfig: LogConfig = {
  name: "app",
  level: "info",
  includeDeviceInfo: true,
  transports: [
    {
      type: "console",
      formatter: "simple",
      level: "info",
    },
  ],
};

export const developmentConfig: LogConfig = {
  name: "app",
  level: "debug",
  includeDeviceInfo: true,
  transports: [
    {
      type: "console",
      formatter: "console",
      formatterOptions: {
        colorize: false, // Works better in different terminals
        prettyPrint: true,
        includeTimestamp: true,
      },
      level: "debug",
    },
  ],
};

export const testConfig: LogConfig = {
  name: "test",
  level: "error", // Only errors in tests
  includeDeviceInfo: false,
  transports: [], // No output in tests by default
};

export function getDefaultConfig(environment?: string): LogConfig {
  const env = environment || process.env.NODE_ENV || "development";

  switch (env) {
    case "production":
      return { ...productionConfig };
    case "test":
      return { ...testConfig };
    case "development":
    default:
      return { ...developmentConfig };
  }
}

export function mergeConfig(
  baseConfig: LogConfig,
  userConfig: Partial<LogConfig>,
): LogConfig {
  const merged: LogConfig = {
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
```

#### File: packages/shared/src/logging/config/configValidator.ts

```typescript
import type { LogConfig, LogConfigValidator } from "./LogConfig";
import log from "loglevel";

export class ConfigValidator implements LogConfigValidator {
  validate(config: LogConfig): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    // Validate log level
    if (config.level !== undefined) {
      const validLevels = ["trace", "debug", "info", "warn", "error", "silent"];
      const levelStr =
        typeof config.level === "string" ? config.level : String(config.level);

      if (!validLevels.includes(levelStr.toLowerCase())) {
        errors.push(
          `Invalid log level: ${config.level}. Must be one of: ${validLevels.join(", ")}`,
        );
      }
    }

    // Validate transports
    if (config.transports) {
      config.transports.forEach((transport, index) => {
        if (!["console", "file", "custom"].includes(transport.type)) {
          errors.push(
            `Invalid transport type at index ${index}: ${transport.type}`,
          );
        }

        if (
          transport.formatter &&
          !["simple", "console", "json", "custom"].includes(transport.formatter)
        ) {
          errors.push(
            `Invalid formatter at transport ${index}: ${transport.formatter}`,
          );
        }

        if (transport.type === "file" && !transport.filePath) {
          errors.push(`File transport at index ${index} requires filePath`);
        }

        if (transport.level) {
          const validLevels = ["trace", "debug", "info", "warn", "error"];
          if (!validLevels.includes(transport.level.toLowerCase())) {
            errors.push(
              `Invalid transport level at index ${index}: ${transport.level}`,
            );
          }
        }
      });
    }

    // Validate performance options
    if (config.bufferSize !== undefined && config.bufferSize < 0) {
      errors.push("Buffer size must be non-negative");
    }

    if (config.flushInterval !== undefined && config.flushInterval < 0) {
      errors.push("Flush interval must be non-negative");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}

export const defaultValidator = new ConfigValidator();
```

#### File: packages/shared/src/logging/config/index.ts

```typescript
export * from "./LogConfig";
export {
  getDefaultConfig,
  mergeConfig,
  productionConfig,
  developmentConfig,
  testConfig,
} from "./defaultConfig";
export { ConfigValidator, defaultValidator } from "./configValidator";
```

#### File: packages/shared/src/logging/config/**tests**/defaultConfig.test.ts

```typescript
import {
  getDefaultConfig,
  mergeConfig,
  productionConfig,
  developmentConfig,
  testConfig,
} from "../defaultConfig";

describe("defaultConfig", () => {
  describe("getDefaultConfig", () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it("should return production config for production environment", () => {
      const config = getDefaultConfig("production");
      expect(config).toEqual(productionConfig);
      expect(config.level).toBe("info");
    });

    it("should return development config for development environment", () => {
      const config = getDefaultConfig("development");
      expect(config).toEqual(developmentConfig);
      expect(config.level).toBe("debug");
    });

    it("should return test config for test environment", () => {
      const config = getDefaultConfig("test");
      expect(config).toEqual(testConfig);
      expect(config.level).toBe("error");
      expect(config.transports).toHaveLength(0);
    });

    it("should use NODE_ENV when no environment provided", () => {
      process.env.NODE_ENV = "production";
      const config = getDefaultConfig();
      expect(config).toEqual(productionConfig);
    });

    it("should default to development when no environment specified", () => {
      delete process.env.NODE_ENV;
      const config = getDefaultConfig();
      expect(config).toEqual(developmentConfig);
    });
  });

  describe("mergeConfig", () => {
    it("should merge user config over base config", () => {
      const base = { name: "base", level: "info" as const };
      const user = { name: "user", includeDeviceInfo: true };

      const merged = mergeConfig(base, user);

      expect(merged).toEqual({
        name: "user",
        level: "info",
        includeDeviceInfo: true,
      });
    });

    it("should replace transports array entirely", () => {
      const base = {
        transports: [{ type: "console" as const, level: "info" }],
      };
      const user = {
        transports: [{ type: "file" as const, filePath: "/logs/app.log" }],
      };

      const merged = mergeConfig(base, user);

      expect(merged.transports).toHaveLength(1);
      expect(merged.transports![0].type).toBe("file");
    });

    it("should deep merge globalContext", () => {
      const base = {
        globalContext: { app: "test", version: "1.0.0" },
      };
      const user = {
        globalContext: { version: "2.0.0", env: "prod" },
      };

      const merged = mergeConfig(base, user);

      expect(merged.globalContext).toEqual({
        app: "test",
        version: "2.0.0",
        env: "prod",
      });
    });

    it("should handle missing globalContext", () => {
      const base = { name: "app" };
      const user = { globalContext: { userId: 123 } };

      const merged = mergeConfig(base, user);

      expect(merged.globalContext).toEqual({ userId: 123 });
    });
  });

  describe("config presets", () => {
    it("should have valid production config", () => {
      expect(productionConfig).toMatchObject({
        name: "app",
        level: "info",
        includeDeviceInfo: true,
      });
      expect(productionConfig.transports).toHaveLength(1);
      expect(productionConfig.transports![0].type).toBe("console");
    });

    it("should have valid development config", () => {
      expect(developmentConfig).toMatchObject({
        name: "app",
        level: "debug",
        includeDeviceInfo: true,
      });
      expect(developmentConfig.transports![0].formatter).toBe("console");
      expect(
        developmentConfig.transports![0].formatterOptions?.prettyPrint,
      ).toBe(true);
    });

    it("should have valid test config", () => {
      expect(testConfig).toMatchObject({
        name: "test",
        level: "error",
        includeDeviceInfo: false,
        transports: [],
      });
    });
  });
});
```

#### File: packages/shared/src/logging/config/**tests**/configValidator.test.ts

```typescript
import { ConfigValidator } from "../configValidator";
import type { LogConfig } from "../LogConfig";

describe("ConfigValidator", () => {
  let validator: ConfigValidator;

  beforeEach(() => {
    validator = new ConfigValidator();
  });

  describe("valid configurations", () => {
    it("should validate minimal config", () => {
      const config: LogConfig = { name: "test" };
      const result = validator.validate(config);

      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it("should validate complete config", () => {
      const config: LogConfig = {
        name: "app",
        level: "info",
        includeDeviceInfo: true,
        transports: [
          {
            type: "console",
            formatter: "simple",
            level: "debug",
          },
        ],
        globalContext: { app: "test" },
        bufferSize: 100,
        flushInterval: 1000,
      };

      const result = validator.validate(config);
      expect(result.valid).toBe(true);
    });
  });

  describe("log level validation", () => {
    it("should accept valid log levels", () => {
      const levels = ["trace", "debug", "info", "warn", "error", "silent"];

      levels.forEach((level) => {
        const config: LogConfig = { level: level as any };
        const result = validator.validate(config);
        expect(result.valid).toBe(true);
      });
    });

    it("should reject invalid log levels", () => {
      const config: LogConfig = { level: "invalid" as any };
      const result = validator.validate(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Invalid log level: invalid. Must be one of: trace, debug, info, warn, error, silent",
      );
    });
  });

  describe("transport validation", () => {
    it("should reject invalid transport type", () => {
      const config: LogConfig = {
        transports: [{ type: "invalid" as any }],
      };

      const result = validator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Invalid transport type at index 0: invalid",
      );
    });

    it("should reject invalid formatter", () => {
      const config: LogConfig = {
        transports: [{ type: "console", formatter: "invalid" as any }],
      };

      const result = validator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Invalid formatter at transport 0: invalid",
      );
    });

    it("should require filePath for file transport", () => {
      const config: LogConfig = {
        transports: [{ type: "file" }],
      };

      const result = validator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "File transport at index 0 requires filePath",
      );
    });

    it("should validate transport level", () => {
      const config: LogConfig = {
        transports: [{ type: "console", level: "invalid" }],
      };

      const result = validator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Invalid transport level at index 0: invalid",
      );
    });
  });

  describe("performance options validation", () => {
    it("should reject negative buffer size", () => {
      const config: LogConfig = { bufferSize: -1 };
      const result = validator.validate(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Buffer size must be non-negative");
    });

    it("should reject negative flush interval", () => {
      const config: LogConfig = { flushInterval: -100 };
      const result = validator.validate(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Flush interval must be non-negative");
    });

    it("should accept zero values", () => {
      const config: LogConfig = { bufferSize: 0, flushInterval: 0 };
      const result = validator.validate(config);

      expect(result.valid).toBe(true);
    });
  });

  it("should collect multiple errors", () => {
    const config: LogConfig = {
      level: "invalid" as any,
      transports: [
        { type: "invalid" as any },
        { type: "file" }, // Missing filePath
      ],
      bufferSize: -1,
    };

    const result = validator.validate(config);

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(4);
  });
});
```

### Acceptance Criteria

- [ ] Configuration interfaces properly defined with all necessary options
- [ ] Default configurations provided for production, development, and test environments
- [ ] Configuration merging works correctly with deep merge for nested objects
- [ ] Configuration validation catches all invalid values
- [ ] Environment detection works correctly
- [ ] Unit tests achieve 100% code coverage
- [ ] TypeScript compilation succeeds
- [ ] `pnpm quality` passes without issues

### Testing Requirements

- Test all environment configurations
- Test configuration merging logic
- Test all validation rules
- Test error accumulation for multiple issues
- Test edge cases (undefined values, empty configs)
- Verify TypeScript types are properly exported

### Log

**2025-08-02T18:18:17.004831Z** - Implemented comprehensive configuration system for logging module with default configurations, environment-specific presets, validation, and comprehensive unit tests.

Key Features Implemented:

- **Configuration Interfaces**: Created LoggerConfig, TransportConfig, LogFilterConfig, and LogConfigValidator interfaces with proper TypeScript types
- **Environment-Specific Defaults**: Production (info level, simple console), Development (debug level, pretty console), Test (error level, no output)
- **Configuration Merging**: Deep merge functionality with proper handling of nested objects like globalContext
- **Comprehensive Validation**: Validates log levels, transport configurations, performance options with detailed error reporting
- **Export Architecture**: Clean barrel exports following project's single-export-per-file pattern

Technical Implementation:

- Properly renamed LogConfig to LoggerConfig to avoid conflicts with existing logging types
- Adhered to project linting rules requiring single exports per file
- Used proper TypeScript types avoiding 'any' and ensuring type safety
- Implemented comprehensive error collection in validator for multiple validation failures

Testing Coverage:

- 100% test coverage for all configuration functions and validation rules
- Tests cover environment detection, configuration merging, and all validation scenarios
- Edge case testing for invalid configurations and error accumulation
- All 565 tests pass including new configuration system tests

Quality Assurance:

- All TypeScript compilation successful
- All ESLint rules pass
- Prettier formatting applied
- Shared packages rebuilt successfully
- No breaking changes to existing codebase
- filesChanged: ["packages/shared/src/logging/config/LogConfig.ts", "packages/shared/src/logging/config/TransportConfig.ts", "packages/shared/src/logging/config/LogFilterConfig.ts", "packages/shared/src/logging/config/LogConfigValidator.ts", "packages/shared/src/logging/config/productionConfig.ts", "packages/shared/src/logging/config/developmentConfig.ts", "packages/shared/src/logging/config/testConfig.ts", "packages/shared/src/logging/config/getDefaultConfig.ts", "packages/shared/src/logging/config/defaultConfig.ts", "packages/shared/src/logging/config/configValidator.ts", "packages/shared/src/logging/config/defaultValidator.ts", "packages/shared/src/logging/config/index.ts", "packages/shared/src/logging/config/__tests__/defaultConfig.test.ts", "packages/shared/src/logging/config/__tests__/configValidator.test.ts"]
