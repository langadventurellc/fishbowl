import { createLoggerSync } from "../createLoggerSync";
import { StructuredLogger } from "../StructuredLogger";
import { getDefaultConfig, mergeConfig } from "../config";
import type { LoggerConfig } from "../config/LogConfig";

// Mock dependencies
jest.mock("../config");
jest.mock("../StructuredLogger");

describe("createLoggerSync", () => {
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
    name: "test-logger-sync",
    level: "info",
    includeDeviceInfo: false, // Device info not gathered in sync version
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

  describe("sync createLoggerSync", () => {
    it("should create a logger synchronously", () => {
      const logger = createLoggerSync();

      expect(mockGetDefaultConfig).toHaveBeenCalled();
      expect(mockMergeConfig).toHaveBeenCalledWith(mockDefaultConfig, {});
      expect(MockStructuredLogger).toHaveBeenCalledWith(
        expect.objectContaining({ getDeviceInfo: expect.any(Function) }),
        expect.objectContaining({
          generateId: expect.any(Function),
          randomBytes: expect.any(Function),
          getByteLength: expect.any(Function),
        }),
        expect.objectContaining({
          level: "info",
          namespace: "test-logger-sync",
          context: expect.any(Object),
          transports: expect.any(Array),
        }),
      );
      expect(logger).toBeDefined();
      expect(MockStructuredLogger).toHaveBeenCalled();
    });

    it("should merge user options with defaults", () => {
      const userConfig = {
        name: "custom-sync-logger",
        level: "debug" as const,
      };
      const userContext = {
        sessionId: "sync-session",
        metadata: { app: "sync-app" },
      };

      createLoggerSync({
        config: userConfig,
        context: userContext,
      });

      expect(mockMergeConfig).toHaveBeenCalledWith(
        mockDefaultConfig,
        userConfig,
      );
      expect(MockStructuredLogger).toHaveBeenCalledWith(
        expect.objectContaining({ getDeviceInfo: expect.any(Function) }),
        expect.objectContaining({
          generateId: expect.any(Function),
          randomBytes: expect.any(Function),
          getByteLength: expect.any(Function),
        }),
        expect.objectContaining({
          level: "debug",
          namespace: "custom-sync-logger",
          context: expect.objectContaining({
            sessionId: "sync-session",
            metadata: expect.objectContaining({
              app: "sync-app",
            }),
          }),
        }),
      );
    });

    it("should not gather device info (sync version)", () => {
      const logger = createLoggerSync({
        config: { includeDeviceInfo: true }, // Even if enabled, sync version skips it
      });

      expect(logger).toBeDefined();
      expect(MockStructuredLogger).toHaveBeenCalled();
      // Device info gathering is not available in sync version
    });

    it("should create console transport when configured", () => {
      createLoggerSync({
        config: {
          transports: [
            {
              type: "console",
              formatter: "console",
              formatterOptions: { colorize: false },
            },
          ],
        },
      });

      expect(MockStructuredLogger).toHaveBeenCalledWith(
        expect.objectContaining({ getDeviceInfo: expect.any(Function) }),
        expect.objectContaining({
          generateId: expect.any(Function),
          randomBytes: expect.any(Function),
          getByteLength: expect.any(Function),
        }),
        expect.objectContaining({
          transports: expect.arrayContaining([expect.any(Object)]),
        }),
      );
    });

    it("should create default console transport when no transports specified", () => {
      mockMergeConfig.mockReturnValue({
        ...mockDefaultConfig,
        transports: undefined,
      });

      createLoggerSync();

      expect(MockStructuredLogger).toHaveBeenCalledWith(
        expect.objectContaining({ getDeviceInfo: expect.any(Function) }),
        expect.objectContaining({
          generateId: expect.any(Function),
          randomBytes: expect.any(Function),
          getByteLength: expect.any(Function),
        }),
        expect.objectContaining({
          transports: expect.arrayContaining([expect.any(Object)]),
        }),
      );
    });

    it("should create platform-agnostic logger without process metadata", () => {
      createLoggerSync();

      expect(MockStructuredLogger).toHaveBeenCalledWith(
        expect.objectContaining({ getDeviceInfo: expect.any(Function) }),
        expect.objectContaining({
          generateId: expect.any(Function),
          randomBytes: expect.any(Function),
          getByteLength: expect.any(Function),
        }),
        expect.objectContaining({
          context: expect.not.objectContaining({
            metadata: expect.objectContaining({
              process: expect.anything(),
            }),
          }),
        }),
      );
    });

    it("should handle global context merging", () => {
      const globalContext = { service: "sync-api", environment: "test" };

      createLoggerSync({
        config: { globalContext },
        context: { metadata: { requestId: "sync-123" } },
      });

      expect(MockStructuredLogger).toHaveBeenCalledWith(
        expect.objectContaining({ getDeviceInfo: expect.any(Function) }),
        expect.objectContaining({
          generateId: expect.any(Function),
          randomBytes: expect.any(Function),
          getByteLength: expect.any(Function),
        }),
        expect.objectContaining({
          context: expect.objectContaining({
            metadata: expect.objectContaining({
              requestId: "sync-123",
              service: "sync-api",
              environment: "test",
            }),
          }),
        }),
      );
    });

    it("should warn about unimplemented transports", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      createLoggerSync({
        config: {
          transports: [
            { type: "file", filePath: "/logs/sync.log" },
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
  });

  describe("level conversion", () => {
    it("should convert string levels correctly", () => {
      createLoggerSync({
        config: { level: "error" },
      });

      expect(MockStructuredLogger).toHaveBeenCalledWith(
        expect.objectContaining({ getDeviceInfo: expect.any(Function) }),
        expect.objectContaining({
          generateId: expect.any(Function),
          randomBytes: expect.any(Function),
          getByteLength: expect.any(Function),
        }),
        expect.objectContaining({
          level: "error",
        }),
      );
    });

    it("should convert numeric levels correctly", () => {
      createLoggerSync({
        config: { level: 5 as unknown as "error" }, // error level
      });

      expect(MockStructuredLogger).toHaveBeenCalledWith(
        expect.objectContaining({ getDeviceInfo: expect.any(Function) }),
        expect.objectContaining({
          generateId: expect.any(Function),
          randomBytes: expect.any(Function),
          getByteLength: expect.any(Function),
        }),
        expect.objectContaining({
          level: "error",
        }),
      );
    });

    it("should handle undefined level", () => {
      createLoggerSync({
        config: { level: undefined },
      });

      expect(MockStructuredLogger).toHaveBeenCalledWith(
        expect.objectContaining({ getDeviceInfo: expect.any(Function) }),
        expect.objectContaining({
          generateId: expect.any(Function),
          randomBytes: expect.any(Function),
          getByteLength: expect.any(Function),
        }),
        expect.objectContaining({
          level: undefined,
        }),
      );
    });
  });
});
