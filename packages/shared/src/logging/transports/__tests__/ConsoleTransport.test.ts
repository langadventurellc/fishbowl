import * as log from "loglevel";
import { ConsoleTransport } from "../ConsoleTransport";
import type { LogEntry } from "../../types";
import { SimpleFormatter } from "../../formatters/SimpleFormatter";
import type { LogLevelNames } from "loglevel";

// Mock loglevel
jest.mock("loglevel");

// Mock console methods
const mockConsole = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

Object.assign(console, mockConsole);

describe("ConsoleTransport", () => {
  let mockLogger: jest.Mocked<log.Logger>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockLogger = {
      trace: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      setLevel: jest.fn(),
    } as unknown as jest.Mocked<log.Logger>;

    (log.getLogger as jest.Mock).mockReturnValue(mockLogger);
  });

  const createMockEntry = (overrides: Partial<LogEntry> = {}): LogEntry => ({
    timestamp: "2025-01-01T00:00:00.000Z",
    level: "info",
    message: "Test message",
    namespace: "test",
    ...overrides,
  });

  describe("constructor", () => {
    it("should create logger with default name", () => {
      new ConsoleTransport();
      expect(log.getLogger).toHaveBeenCalledWith("ConsoleTransport");
    });

    it("should create logger with custom name", () => {
      new ConsoleTransport({ name: "CustomLogger" });
      expect(log.getLogger).toHaveBeenCalledWith("CustomLogger");
    });

    it("should use default formatter when none provided", () => {
      const transport = new ConsoleTransport();
      expect(transport.name).toBe("ConsoleTransport");
    });

    it("should use custom formatter when provided", () => {
      const customFormatter = new SimpleFormatter();
      const transport = new ConsoleTransport({
        formatter: customFormatter,
        name: "TestTransport",
      });
      expect(transport.name).toBe("TestTransport");
    });

    it("should set default log level to info", () => {
      new ConsoleTransport();
      expect(mockLogger.setLevel).toHaveBeenCalledWith("info");
    });

    it("should set custom log level when provided", () => {
      new ConsoleTransport({ minLevel: "warn" });
      expect(mockLogger.setLevel).toHaveBeenCalledWith("warn");
    });
  });

  describe("write", () => {
    let transport: ConsoleTransport;

    beforeEach(() => {
      transport = new ConsoleTransport();
    });

    it("should write string messages to console.log", () => {
      transport.write("Test message");
      expect(mockConsole.log).toHaveBeenCalledWith("Test message");
    });

    it("should stringify object messages", () => {
      const objMessage = { level: "info", message: "test" };
      transport.write(objMessage);
      expect(mockConsole.log).toHaveBeenCalledWith(JSON.stringify(objMessage));
    });
  });

  describe("shouldLog", () => {
    it("should respect minimum log level - info level transport", () => {
      const transport = new ConsoleTransport({ minLevel: "info" });

      expect(transport.shouldLog(createMockEntry({ level: "trace" }))).toBe(
        false,
      );
      expect(transport.shouldLog(createMockEntry({ level: "debug" }))).toBe(
        false,
      );
      expect(transport.shouldLog(createMockEntry({ level: "info" }))).toBe(
        true,
      );
      expect(transport.shouldLog(createMockEntry({ level: "warn" }))).toBe(
        true,
      );
      expect(transport.shouldLog(createMockEntry({ level: "error" }))).toBe(
        true,
      );
    });

    it("should respect minimum log level - warn level transport", () => {
      const transport = new ConsoleTransport({ minLevel: "warn" });

      expect(transport.shouldLog(createMockEntry({ level: "trace" }))).toBe(
        false,
      );
      expect(transport.shouldLog(createMockEntry({ level: "debug" }))).toBe(
        false,
      );
      expect(transport.shouldLog(createMockEntry({ level: "info" }))).toBe(
        false,
      );
      expect(transport.shouldLog(createMockEntry({ level: "warn" }))).toBe(
        true,
      );
      expect(transport.shouldLog(createMockEntry({ level: "error" }))).toBe(
        true,
      );
    });

    it("should respect minimum log level - error level transport", () => {
      const transport = new ConsoleTransport({ minLevel: "error" });

      expect(transport.shouldLog(createMockEntry({ level: "trace" }))).toBe(
        false,
      );
      expect(transport.shouldLog(createMockEntry({ level: "debug" }))).toBe(
        false,
      );
      expect(transport.shouldLog(createMockEntry({ level: "info" }))).toBe(
        false,
      );
      expect(transport.shouldLog(createMockEntry({ level: "warn" }))).toBe(
        false,
      );
      expect(transport.shouldLog(createMockEntry({ level: "error" }))).toBe(
        true,
      );
    });
  });

  describe("log", () => {
    let transport: ConsoleTransport;

    beforeEach(() => {
      transport = new ConsoleTransport({
        formatter: new SimpleFormatter(),
        minLevel: "trace", // Allow all levels for testing
      });
    });

    it("should route TRACE level to console.debug", () => {
      const entry = createMockEntry({
        level: "trace",
        message: "Trace message",
      });
      transport.log(entry);
      expect(mockConsole.debug).toHaveBeenCalledWith("[TRACE] Trace message");
    });

    it("should route DEBUG level to console.debug", () => {
      const entry = createMockEntry({
        level: "debug",
        message: "Debug message",
      });
      transport.log(entry);
      expect(mockConsole.debug).toHaveBeenCalledWith("[DEBUG] Debug message");
    });

    it("should route INFO level to console.log", () => {
      const entry = createMockEntry({ level: "info", message: "Info message" });
      transport.log(entry);
      expect(mockConsole.log).toHaveBeenCalledWith("[INFO] Info message");
    });

    it("should route WARN level to console.warn", () => {
      const entry = createMockEntry({
        level: "warn",
        message: "Warning message",
      });
      transport.log(entry);
      expect(mockConsole.warn).toHaveBeenCalledWith("[WARN] Warning message");
    });

    it("should route ERROR level to console.error", () => {
      const entry = createMockEntry({
        level: "error",
        message: "Error message",
      });
      transport.log(entry);
      expect(mockConsole.error).toHaveBeenCalledWith("[ERROR] Error message");
    });

    it("should not log entries below minimum level", () => {
      const transport = new ConsoleTransport({
        formatter: new SimpleFormatter(),
        minLevel: "warn",
      });

      transport.log(
        createMockEntry({ level: "debug", message: "Debug message" }),
      );
      transport.log(
        createMockEntry({ level: "info", message: "Info message" }),
      );

      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.log).not.toHaveBeenCalled();
    });

    it("should format with custom formatter", () => {
      const mockFormatter = {
        format: jest.fn().mockReturnValue("CUSTOM FORMAT"),
      };

      const transport = new ConsoleTransport({
        formatter: mockFormatter,
        minLevel: "trace",
      });
      const entry = createMockEntry({ level: "info", message: "Test" });

      transport.log(entry);

      expect(mockFormatter.format).toHaveBeenCalledWith(entry);
      expect(mockConsole.log).toHaveBeenCalledWith("CUSTOM FORMAT");
    });

    it("should handle formatter returning object", () => {
      const mockFormatter = {
        format: jest.fn().mockReturnValue({ formatted: "object" }),
      };

      const transport = new ConsoleTransport({
        formatter: mockFormatter,
        minLevel: "trace",
      });
      const entry = createMockEntry({ level: "info", message: "Test" });

      transport.log(entry);

      expect(mockFormatter.format).toHaveBeenCalledWith(entry);
      expect(mockConsole.log).toHaveBeenCalledWith('{"formatted":"object"}');
    });

    it("should fallback to console.log for unknown levels", () => {
      const entry = createMockEntry({
        level: "unknown" as LogLevelNames,
        message: "Unknown level message",
      });
      transport.log(entry);
      expect(mockConsole.log).toHaveBeenCalledWith(
        "[UNKNOWN] Unknown level message",
      );
    });
  });

  describe("setLevel", () => {
    let transport: ConsoleTransport;

    beforeEach(() => {
      transport = new ConsoleTransport();
    });

    it("should update logger level", () => {
      transport.setLevel("debug");
      expect(mockLogger.setLevel).toHaveBeenCalledWith("debug");
    });

    it("should update internal minLevel and affect shouldLog", () => {
      transport.setLevel("error");

      // After setting level to error, should only log error level
      expect(transport.shouldLog(createMockEntry({ level: "warn" }))).toBe(
        false,
      );
      expect(transport.shouldLog(createMockEntry({ level: "error" }))).toBe(
        true,
      );
    });
  });

  describe("Transport interface compliance", () => {
    it("should have required name property", () => {
      const transport = new ConsoleTransport({ name: "TestTransport" });
      expect(transport.name).toBe("TestTransport");
    });

    it("should implement write method", () => {
      const transport = new ConsoleTransport();
      expect(typeof transport.write).toBe("function");
    });

    it("should implement shouldLog method", () => {
      const transport = new ConsoleTransport();
      expect(typeof transport.shouldLog).toBe("function");
    });
  });
});
