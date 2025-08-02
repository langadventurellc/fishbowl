import { createLogger } from "../createLogger";
import { StructuredLogger } from "../StructuredLogger";
import { getDeviceInfo } from "../utils/getDeviceInfo";
import { getDefaultConfig, mergeConfig } from "../config";
import type { LoggerConfig } from "../config/LogConfig";

// Mock dependencies
jest.mock("../utils/getDeviceInfo");
jest.mock("../config");
jest.mock("../StructuredLogger");

describe("createLogger", () => {
  const mockGetDeviceInfo = getDeviceInfo as jest.MockedFunction<
    typeof getDeviceInfo
  >;
  const mockGetDefaultConfig = getDefaultConfig as jest.MockedFunction<
    typeof getDefaultConfig
  >;
  const mockMergeConfig = mergeConfig as jest.MockedFunction<
    typeof mergeConfig
  >;
  const MockStructuredLogger = StructuredLogger as jest.MockedClass<
    typeof StructuredLogger
  >;

  const mockDefaultConfig: LoggerConfig = {
    name: "test-logger",
    level: "info",
    includeDeviceInfo: true,
    transports: [
      {
        type: "console",
        formatter: "simple",
      },
    ],
    globalContext: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDefaultConfig.mockReturnValue(mockDefaultConfig);
    mockMergeConfig.mockImplementation((defaults, options) => ({
      ...defaults,
      ...options,
    }));
    mockGetDeviceInfo.mockResolvedValue({
      platform: "desktop",
      deviceInfo: {
        platform: "test-platform",
        arch: "x64",
        hostname: "test-host",
      },
    });
    MockStructuredLogger.mockImplementation(
      (_config) =>
        ({
          debug: jest.fn(),
          info: jest.fn(),
          warn: jest.fn(),
          error: jest.fn(),
          constructor: StructuredLogger,
        }) as unknown as StructuredLogger,
    );
  });

  describe("async createLogger", () => {
    it("should create a logger with default configuration", async () => {
      const logger = await createLogger();

      expect(mockGetDefaultConfig).toHaveBeenCalled();
      expect(mockMergeConfig).toHaveBeenCalledWith(mockDefaultConfig, {});
      expect(MockStructuredLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "info",
          namespace: "test-logger",
          context: expect.any(Object),
          transports: expect.any(Array),
        }),
      );
      expect(logger).toBeDefined();
      expect(MockStructuredLogger).toHaveBeenCalled();
    });

    it("should merge user options with defaults", async () => {
      const userConfig = {
        name: "custom-logger",
        level: "debug" as const,
      };
      const userContext = {
        sessionId: "test-session",
        metadata: { app: "test-app" },
      };

      await createLogger({
        config: userConfig,
        context: userContext,
      });

      expect(mockMergeConfig).toHaveBeenCalledWith(
        mockDefaultConfig,
        userConfig,
      );
      expect(MockStructuredLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "debug",
          namespace: "custom-logger",
          context: expect.objectContaining({
            sessionId: "test-session",
            metadata: expect.objectContaining({
              app: "test-app",
            }),
          }),
        }),
      );
    });

    it("should include device info when enabled", async () => {
      const mockDeviceContext = {
        platform: "desktop" as const,
        deviceInfo: {
          platform: "test-platform",
          arch: "x64",
          hostname: "test-host",
        },
      };
      mockGetDeviceInfo.mockResolvedValue(mockDeviceContext);

      await createLogger({
        config: { includeDeviceInfo: true },
      });

      expect(mockGetDeviceInfo).toHaveBeenCalled();
      expect(MockStructuredLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            platform: "desktop",
            deviceInfo: mockDeviceContext.deviceInfo,
          }),
        }),
      );
    });

    it("should skip device info when disabled", async () => {
      await createLogger({
        config: { includeDeviceInfo: false },
      });

      expect(mockGetDeviceInfo).not.toHaveBeenCalled();
    });

    it("should handle device info gathering failure gracefully", async () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
      mockGetDeviceInfo.mockRejectedValue(new Error("Device info error"));

      const logger = await createLogger({
        config: { includeDeviceInfo: true },
      });

      expect(mockGetDeviceInfo).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to gather device info:",
        expect.any(Error),
      );
      expect(logger).toBeDefined();
      expect(MockStructuredLogger).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should create console transport when configured", async () => {
      await createLogger({
        config: {
          transports: [
            {
              type: "console",
              formatter: "console",
              formatterOptions: { colorize: true },
            },
          ],
        },
      });

      expect(MockStructuredLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          transports: expect.arrayContaining([expect.any(Object)]),
        }),
      );
    });

    it("should create default console transport when no transports specified", async () => {
      mockMergeConfig.mockReturnValue({
        ...mockDefaultConfig,
        transports: undefined,
      });

      await createLogger();

      expect(MockStructuredLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          transports: expect.arrayContaining([expect.any(Object)]),
        }),
      );
    });

    it("should warn about unimplemented transports", async () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      await createLogger({
        config: {
          transports: [
            { type: "file", filePath: "/logs/app.log" },
            { type: "custom" },
            { type: "unknown" as "console" | "file" | "custom" },
          ],
        },
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "File transport not yet implemented",
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "Custom transport requires implementation",
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "Unknown transport type: unknown",
      );

      consoleSpy.mockRestore();
    });

    it("should include process info in context", async () => {
      await createLogger();

      expect(MockStructuredLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            metadata: expect.objectContaining({
              process: expect.objectContaining({
                pid: process.pid,
                platform: process.platform,
                version: process.version,
                nodeVersion: process.versions.node,
              }),
            }),
          }),
        }),
      );
    });

    it("should handle global context merging", async () => {
      const globalContext = { service: "api", environment: "test" };

      await createLogger({
        config: { globalContext },
        context: { metadata: { requestId: "123" } },
      });

      expect(MockStructuredLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            metadata: expect.objectContaining({
              requestId: "123",
              service: "api",
              environment: "test",
            }),
          }),
        }),
      );
    });
  });

  describe("level conversion", () => {
    it("should convert string levels correctly", async () => {
      await createLogger({
        config: { level: "warn" },
      });

      expect(MockStructuredLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "warn",
        }),
      );
    });

    it("should convert numeric levels correctly", async () => {
      await createLogger({
        config: { level: 4 as unknown as "warn" }, // warn level
      });

      expect(MockStructuredLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "warn",
        }),
      );
    });

    it("should handle undefined level", async () => {
      await createLogger({
        config: { level: undefined },
      });

      expect(MockStructuredLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          level: undefined,
        }),
      );
    });
  });
});
