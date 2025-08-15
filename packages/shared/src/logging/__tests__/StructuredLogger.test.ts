import { StructuredLogger } from "../StructuredLogger";
import type { LogEntry, Transport, Formatter, ErrorInfo } from "../types";
import type { DeviceInfoInterface } from "../DeviceInfoInterface";
import type { CryptoUtilsInterface } from "../../utils/CryptoUtilsInterface";

// Mock dependencies at module level
jest.mock("../utils/detectPlatform", () => ({
  detectPlatform: jest.fn(),
}));

jest.mock("../utils/errorSerializer", () => ({
  serializeError: jest.fn(),
}));

// Import the mocked functions
import { detectPlatform } from "../utils/detectPlatform";
import { serializeError } from "../utils/errorSerializer";

const mockDetectPlatform = detectPlatform as jest.MockedFunction<
  typeof detectPlatform
>;
const mockSerializeError = serializeError as jest.MockedFunction<
  typeof serializeError
>;

// Mock loglevel
jest.mock("loglevel", () => ({
  __esModule: true,
  default: {
    getLogger: jest.fn(() => ({
      setLevel: jest.fn(),
      getLevel: jest.fn(() => 2), // Return info level by default
      trace: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    })),
  },
}));

import log from "loglevel";

describe("StructuredLogger", () => {
  let mockLogger: jest.Mocked<log.Logger>;
  let mockTransport: Transport;
  let mockFormatter: Formatter;
  let mockDeviceInfo: jest.Mocked<DeviceInfoInterface>;
  let mockCryptoUtils: jest.Mocked<CryptoUtilsInterface>;

  // Helper function to create logger with mocks
  const createTestLogger = (config?: Record<string, unknown>) => {
    return new StructuredLogger(mockDeviceInfo, mockCryptoUtils, config);
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Set up mock platform detection
    mockDetectPlatform.mockReturnValue({
      type: "web",
      isElectron: false,
      isElectronMain: false,
      isElectronRenderer: false,
      isReactNative: false,
      isWeb: true,
    });

    // Set up mock error serializer
    mockSerializeError.mockImplementation((error: unknown) => {
      if (error instanceof Error) {
        return {
          name: error.name,
          message: error.message,
          stack: error.stack,
        };
      }
      return { name: "UnknownError", message: String(error) };
    });

    // Set up mock logger with stateful level tracking
    let currentLevel = 2; // Default to info level
    mockLogger = {
      setLevel: jest.fn((level: string | number) => {
        // Convert level name to number for internal tracking
        const levelMap: Record<string, number> = {
          trace: 0,
          debug: 1,
          info: 2,
          warn: 3,
          error: 4,
        };
        currentLevel =
          typeof level === "string" ? (levelMap[level] ?? 2) : level;
      }),
      getLevel: jest.fn(() => currentLevel),
      trace: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as unknown as jest.Mocked<log.Logger>;

    (log.getLogger as jest.Mock).mockReturnValue(mockLogger);

    // Set up mock device info
    mockDeviceInfo = {
      getDeviceInfo: jest.fn().mockResolvedValue({
        platform: "desktop",
        deviceInfo: { platform: "test" },
      }),
    };

    // Set up mock crypto utils
    let idCounter = 0;
    mockCryptoUtils = {
      randomBytes: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
      generateId: jest
        .fn()
        .mockImplementation(() => `test-session-id-${++idCounter}`),
      getByteLength: jest.fn().mockResolvedValue(10),
    };

    // Set up mock transport
    mockTransport = {
      name: "TestTransport",
      write: jest.fn(),
      shouldLog: jest.fn(() => true),
    };

    // Set up mock formatter
    mockFormatter = {
      format: jest.fn((entry: LogEntry) => `formatted: ${entry.message}`),
    };

    // Set fixed date for tests
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("constructor", () => {
    it("should create logger with default configuration", () => {
      new StructuredLogger(mockDeviceInfo, mockCryptoUtils);

      expect(log.getLogger).toHaveBeenCalledWith("app");
    });

    it("should create logger with custom namespace", () => {
      createTestLogger({ namespace: "custom-logger" });

      expect(log.getLogger).toHaveBeenCalledWith("custom-logger");
    });

    it("should set custom log level", () => {
      createTestLogger({ level: "debug" });

      expect(mockLogger.setLevel).toHaveBeenCalledWith("debug");
    });

    it("should initialize with custom context", () => {
      const customContext = { userId: "123", app: "test" };
      const logger = createTestLogger({ context: customContext });

      // Test by logging and checking if context is included
      logger.addTransport(mockTransport);
      logger.info("test message");

      expect(mockTransport.write).toHaveBeenCalledWith(
        expect.stringContaining("userId"),
      );
    });

    it("should set up formatter and transports from config", () => {
      const logger = createTestLogger({
        formatter: mockFormatter,
        transports: [mockTransport],
      });

      logger.info("test message");

      expect(mockFormatter.format).toHaveBeenCalled();
      expect(mockTransport.write).toHaveBeenCalled();
    });

    it("should detect mobile platform correctly", async () => {
      // Set up mobile platform before creating logger
      mockDetectPlatform.mockReturnValue({
        type: "react-native",
        isElectron: false,
        isElectronMain: false,
        isElectronRenderer: false,
        isReactNative: true,
        isWeb: false,
      });

      // Create custom mock deviceInfo for mobile
      let resolveDeviceInfo: (value: {
        platform: "mobile";
        deviceInfo: { platform: string };
      }) => void;
      const deviceInfoPromise = new Promise((resolve) => {
        resolveDeviceInfo = resolve;
      });

      const mobileDeviceInfo = {
        getDeviceInfo: jest.fn().mockImplementation(() => {
          const result = {
            platform: "mobile" as const,
            deviceInfo: { platform: "react-native" },
          };
          resolveDeviceInfo(result);
          return Promise.resolve(result);
        }),
      };

      const logger = new StructuredLogger(
        mobileDeviceInfo as DeviceInfoInterface,
        mockCryptoUtils,
      );
      logger.addTransport(mockTransport);

      // Wait for the device info to be resolved
      await deviceInfoPromise;

      logger.info("test");

      expect(mockTransport.write).toHaveBeenCalledWith(
        expect.stringContaining('"platform":"mobile"'),
      );
    });
  });

  describe("log level management", () => {
    let logger: StructuredLogger;

    beforeEach(() => {
      logger = createTestLogger();
    });

    it("should set log level", () => {
      logger.setLevel("warn");
      expect(mockLogger.setLevel).toHaveBeenCalledWith("warn");
    });

    it("should get current log level", () => {
      mockLogger.getLevel.mockReturnValue(3); // warn level
      expect(logger.getLevel()).toBe("warn");
    });

    it("should return info for out-of-range log level numbers", () => {
      // Mock getLevel to return a number outside the expected range
      jest.spyOn(mockLogger, "getLevel").mockReturnValue(5);
      expect(logger.getLevel()).toBe("info"); // fallback
    });
  });

  describe("logging methods", () => {
    let logger: StructuredLogger;

    beforeEach(() => {
      logger = createTestLogger();
      logger.addTransport(mockTransport);
    });

    it("should log trace messages", () => {
      const testData = { userId: "123" };
      logger.trace("trace message", testData);

      expect(mockTransport.write).toHaveBeenCalledWith(
        expect.stringContaining('"level":"trace"'),
      );
      expect(mockTransport.write).toHaveBeenCalledWith(
        expect.stringContaining("trace message"),
      );
      expect(mockTransport.write).toHaveBeenCalledWith(
        expect.stringContaining('"userId":"123"'),
      );
    });

    it("should log debug messages", () => {
      logger.debug("debug message");

      expect(mockTransport.write).toHaveBeenCalledWith(
        expect.stringContaining('"level":"debug"'),
      );
    });

    it("should log info messages", () => {
      logger.info("info message");

      expect(mockTransport.write).toHaveBeenCalledWith(
        expect.stringContaining('"level":"info"'),
      );
    });

    it("should log warn messages", () => {
      logger.warn("warn message");

      expect(mockTransport.write).toHaveBeenCalledWith(
        expect.stringContaining('"level":"warn"'),
      );
    });

    it("should log error messages with Error objects", () => {
      const error = new Error("Test error");
      error.stack = "Error: Test error\n    at test";

      logger.error("error message", error, { context: "test" });

      expect(mockSerializeError).toHaveBeenCalledWith(error);
      expect(mockTransport.write).toHaveBeenCalledWith(
        expect.stringContaining('"level":"error"'),
      );
      expect(mockTransport.write).toHaveBeenCalledWith(
        expect.stringContaining("error message"),
      );
    });

    it("should log error messages with ErrorInfo objects", () => {
      const errorInfo: ErrorInfo = {
        name: "ValidationError",
        message: "Invalid input",
        stack: "ValidationError: Invalid input\n    at validate",
      };

      logger.error("validation failed", errorInfo);

      expect(mockSerializeError).not.toHaveBeenCalled();
      expect(mockTransport.write).toHaveBeenCalledWith(
        expect.stringContaining("validation failed"),
      );
    });

    it("should log fatal messages as error level", () => {
      logger.fatal("fatal message");

      expect(mockTransport.write).toHaveBeenCalledWith(
        expect.stringContaining('"level":"error"'),
      );
      expect(mockTransport.write).toHaveBeenCalledWith(
        expect.stringContaining("fatal message"),
      );
    });

    it("should include timestamp in log entries", () => {
      logger.info("timestamped message");

      expect(mockTransport.write).toHaveBeenCalledWith(
        expect.stringContaining('"timestamp":"2025-01-01T00:00:00.000Z"'),
      );
    });

    it("should include namespace in log entries", () => {
      const namedLogger = createTestLogger({ namespace: "test-ns" });
      namedLogger.addTransport(mockTransport);
      namedLogger.info("namespaced message");

      expect(mockTransport.write).toHaveBeenCalledWith(
        expect.stringContaining('"namespace":"test-ns"'),
      );
    });
  });

  describe("context management", () => {
    let logger: StructuredLogger;

    beforeEach(() => {
      logger = createTestLogger();
      logger.addTransport(mockTransport);
    });

    it("should include session ID in context", () => {
      logger.info("test message");

      expect(mockTransport.write).toHaveBeenCalledWith(
        expect.stringContaining('"sessionId"'),
      );
    });

    it("should create child logger with additional context", () => {
      const childLogger = logger.child({
        userId: "456",
        metadata: { module: "auth" },
      });
      childLogger.addTransport(mockTransport);
      childLogger.info("child message");

      expect(mockTransport.write).toHaveBeenCalledWith(
        expect.stringContaining('"userId":"456"'),
      );
      expect(mockTransport.write).toHaveBeenCalledWith(
        expect.stringContaining('"module":"auth"'),
      );
    });

    it("should isolate child logger context from parent", () => {
      const childLogger = logger.child({
        metadata: { module: "child" },
      });
      childLogger.addTransport(mockTransport);

      childLogger.info("child message");
      logger.info("parent message");

      const calls = (mockTransport.write as jest.Mock).mock.calls;

      // Child message should contain child context
      expect(calls[0][0]).toContain('"module":"child"');

      // Parent message (last call) should not contain child context
      const parentCall = calls[calls.length - 1][0];
      expect(parentCall).toContain('"message":"parent message"');
      expect(parentCall).not.toContain('"module":"child"');
    });

    it("should inherit configuration in child logger", () => {
      const parentLogger = createTestLogger({
        level: "warn",
        formatter: mockFormatter,
      });
      const childLogger = parentLogger.child({ userId: "123" });

      expect(childLogger.getLevel()).toBe("warn");
    });
  });

  describe("transport management", () => {
    let logger: StructuredLogger;

    beforeEach(() => {
      logger = createTestLogger();
    });

    it("should add transport", () => {
      logger.addTransport(mockTransport);
      logger.info("test message");

      expect(mockTransport.write).toHaveBeenCalled();
    });

    it("should remove transport", () => {
      logger.addTransport(mockTransport);
      logger.removeTransport(mockTransport);
      logger.info("test message");

      expect(mockTransport.write).not.toHaveBeenCalled();
    });

    it("should handle multiple transports", () => {
      const transport2: Transport = {
        name: "Transport2",
        write: jest.fn(),
        shouldLog: jest.fn(() => true),
      };

      logger.addTransport(mockTransport);
      logger.addTransport(transport2);
      logger.info("test message");

      expect(mockTransport.write).toHaveBeenCalled();
      expect(transport2.write).toHaveBeenCalled();
    });

    it("should respect transport shouldLog filter", () => {
      mockTransport.shouldLog = jest.fn(() => false);
      logger.addTransport(mockTransport);
      logger.info("filtered message");

      expect(mockTransport.shouldLog).toHaveBeenCalled();
      expect(mockTransport.write).not.toHaveBeenCalled();
    });

    it("should handle transport without shouldLog method", () => {
      const simpleTransport: Transport = {
        name: "SimpleTransport",
        write: jest.fn(),
      };

      logger.addTransport(simpleTransport);
      logger.info("test message");

      expect(simpleTransport.write).toHaveBeenCalled();
    });

    it("should handle transport errors gracefully", () => {
      const faultyTransport: Transport = {
        name: "FaultyTransport",
        write: jest.fn(() => {
          throw new Error("Transport error");
        }),
      };

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      logger.addTransport(faultyTransport);
      logger.info("test message");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Transport error:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it("should fallback to console when no transports", () => {
      logger.info("console message", { test: "data" });

      expect(mockLogger.info).toHaveBeenCalledWith(
        "console message",
        expect.objectContaining({ test: "data" }),
      );
    });
  });

  describe("formatter management", () => {
    let logger: StructuredLogger;

    beforeEach(() => {
      logger = createTestLogger();
      logger.addTransport(mockTransport);
    });

    it("should set formatter", () => {
      logger.setFormatter(mockFormatter);
      logger.info("formatted message");

      expect(mockFormatter.format).toHaveBeenCalled();
      expect(mockTransport.write).toHaveBeenCalledWith(
        "formatted: formatted message",
      );
    });

    it("should use formatter for each transport call", () => {
      logger.setFormatter(mockFormatter);
      logger.info("test");
      logger.warn("another test");

      expect(mockFormatter.format).toHaveBeenCalledTimes(2);
    });

    it("should handle formatter returning objects", () => {
      const objectFormatter: Formatter = {
        format: jest.fn(() => ({ formatted: true, message: "object" })),
      };

      logger.setFormatter(objectFormatter);
      logger.info("test message");

      expect(mockTransport.write).toHaveBeenCalledWith(
        '{"formatted":true,"message":"object"}',
      );
    });
  });

  describe("error handling", () => {
    let logger: StructuredLogger;

    beforeEach(() => {
      logger = createTestLogger();
      logger.addTransport(mockTransport);
    });

    it("should handle undefined error", () => {
      logger.error("error with undefined", undefined);

      expect(mockTransport.write).toHaveBeenCalledWith(
        expect.stringContaining("error with undefined"),
      );
    });

    it("should handle no error parameter", () => {
      logger.error("error without error object");

      expect(mockTransport.write).toHaveBeenCalledWith(
        expect.stringContaining("error without error object"),
      );
    });

    it("should serialize complex error objects", () => {
      const complexError = new Error("Complex error");
      complexError.stack = "Error: Complex error\n    at test";

      logger.error("complex error", complexError);

      expect(mockSerializeError).toHaveBeenCalledWith(complexError);
    });
  });

  describe("performance", () => {
    it("should generate unique session IDs", () => {
      const logger1 = createTestLogger();
      const logger2 = createTestLogger();

      logger1.addTransport(mockTransport);
      logger1.info("test");
      const sessionId1 = JSON.parse(
        (mockTransport.write as jest.Mock).mock.calls[0][0],
      ).context.sessionId;

      logger2.addTransport(mockTransport);
      logger2.info("test");
      const sessionId2 = JSON.parse(
        (mockTransport.write as jest.Mock).mock.calls[1][0],
      ).context.sessionId;

      expect(sessionId1).not.toBe(sessionId2);
      expect(typeof sessionId1).toBe("string");
      expect(typeof sessionId2).toBe("string");
    });

    it("should handle high volume logging", () => {
      const logger = createTestLogger();
      logger.addTransport(mockTransport);

      // Log 1000 messages rapidly
      for (let i = 0; i < 1000; i++) {
        logger.info(`Message ${i}`, { index: i });
      }

      expect(mockTransport.write).toHaveBeenCalledTimes(1000);
    });
  });
});
