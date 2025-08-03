import * as loggingExports from "../index";

describe("logging package exports", () => {
  it("should export factory functions", () => {
    expect(loggingExports.createLogger).toBeDefined();
    expect(typeof loggingExports.createLogger).toBe("function");
    expect(loggingExports.createLoggerSync).toBeDefined();
    expect(typeof loggingExports.createLoggerSync).toBe("function");
  });

  it("should export core classes and types", () => {
    expect(loggingExports.StructuredLogger).toBeDefined();
    expect(typeof loggingExports.StructuredLogger).toBe("function");
  });

  it("should export configuration utilities", () => {
    expect(loggingExports.getDefaultConfig).toBeDefined();
    expect(typeof loggingExports.getDefaultConfig).toBe("function");
    expect(loggingExports.mergeConfig).toBeDefined();
    expect(typeof loggingExports.mergeConfig).toBe("function");
    expect(loggingExports.productionConfig).toBeDefined();
    expect(loggingExports.developmentConfig).toBeDefined();
    expect(loggingExports.testConfig).toBeDefined();
    expect(loggingExports.ConfigValidator).toBeDefined();
    expect(loggingExports.defaultValidator).toBeDefined();
  });

  it("should export formatters", () => {
    expect(loggingExports.ConsoleFormatter).toBeDefined();
    expect(typeof loggingExports.ConsoleFormatter).toBe("function");
    expect(loggingExports.SimpleFormatter).toBeDefined();
    expect(typeof loggingExports.SimpleFormatter).toBe("function");
  });

  it("should export transports", () => {
    expect(loggingExports.ConsoleTransport).toBeDefined();
    expect(typeof loggingExports.ConsoleTransport).toBe("function");
  });

  it("should export utilities", () => {
    expect(loggingExports.getDeviceInfo).toBeDefined();
    expect(typeof loggingExports.getDeviceInfo).toBe("function");
    expect(loggingExports.serializeError).toBeDefined();
    expect(typeof loggingExports.serializeError).toBe("function");
    expect(loggingExports.detectPlatform).toBeDefined();
    expect(typeof loggingExports.detectPlatform).toBe("function");
  });

  it("should export all expected functions and classes", () => {
    const expectedExports = [
      // Factory functions
      "createLogger",
      "createLoggerSync",
      // Core
      "StructuredLogger",
      // Configuration
      "getDefaultConfig",
      "mergeConfig",
      "productionConfig",
      "developmentConfig",
      "testConfig",
      "ConfigValidator",
      "defaultValidator",
      // Formatters
      "ConsoleFormatter",
      "SimpleFormatter",
      // Transports
      "ConsoleTransport",
      // Utilities
      "getDeviceInfo",
      "serializeError",
      "detectPlatform",
      "getPlatform",
      "resetPlatformCache",
      "getCachedDeviceInfo",
    ];

    for (const exportName of expectedExports) {
      expect(loggingExports).toHaveProperty(exportName);
      expect(
        loggingExports[exportName as keyof typeof loggingExports],
      ).toBeDefined();
    }
  });

  it("should have consistent export types", () => {
    // Functions should be functions
    const functionExports = [
      "createLogger",
      "createLoggerSync",
      "getDefaultConfig",
      "mergeConfig",
      "getDeviceInfo",
      "serializeError",
      "detectPlatform",
      "getPlatform",
      "resetPlatformCache",
      "getCachedDeviceInfo",
    ];

    for (const funcName of functionExports) {
      expect(
        typeof loggingExports[funcName as keyof typeof loggingExports],
      ).toBe("function");
    }

    // Classes should be functions (constructors)
    const classExports = [
      "StructuredLogger",
      "ConsoleFormatter",
      "SimpleFormatter",
      "ConsoleTransport",
      "ConfigValidator",
    ];

    for (const className of classExports) {
      expect(
        typeof loggingExports[className as keyof typeof loggingExports],
      ).toBe("function");
    }

    // Config objects should be objects
    const objectExports = [
      "productionConfig",
      "developmentConfig",
      "testConfig",
      "defaultValidator",
    ];

    for (const objName of objectExports) {
      expect(
        typeof loggingExports[objName as keyof typeof loggingExports],
      ).toBe("object");
    }
  });
});
