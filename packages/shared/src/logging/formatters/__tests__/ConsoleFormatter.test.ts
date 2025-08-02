import { ConsoleFormatter } from "../ConsoleFormatter";
import type { LogEntry } from "../../types";
import type { LogLevelNames } from "loglevel";

describe("ConsoleFormatter", () => {
  const createMockEntry = (overrides: Partial<LogEntry> = {}): LogEntry => ({
    timestamp: "2025-01-01T00:00:00.000Z",
    level: "info",
    message: "Test message",
    namespace: "test",
    ...overrides,
  });

  describe("constructor", () => {
    it("should use default options when none provided", () => {
      const formatter = new ConsoleFormatter();
      const entry = createMockEntry();
      const output = formatter.format(entry);

      expect(typeof output).toBe("string");
      expect(output).toContain("[2025-01-01T00:00:00.000Z]");
      expect(output).toContain("[INFO]");
      expect(output).toContain("Test message");
    });

    it("should override defaults with provided options", () => {
      const formatter = new ConsoleFormatter({ includeTimestamp: false });
      const entry = createMockEntry();
      const output = formatter.format(entry);

      expect(output).not.toContain("[2025-01-01T00:00:00.000Z]");
      expect(output).toContain("[INFO]");
    });
  });

  describe("format", () => {
    it("should format basic log entry without colors", () => {
      const formatter = new ConsoleFormatter({ colorize: false });
      const entry = createMockEntry();
      const output = formatter.format(entry);

      expect(output).toBe("[2025-01-01T00:00:00.000Z] [INFO] Test message");
    });

    it("should include context when present", () => {
      const formatter = new ConsoleFormatter({ colorize: false });
      const entry = createMockEntry({
        context: { userId: "123", metadata: { action: "login" } },
      });
      const output = formatter.format(entry);

      expect(output).toContain('"userId":"123"');
      expect(output).toContain('"action":"login"');
    });

    it("should include error when present", () => {
      const formatter = new ConsoleFormatter({ colorize: false });
      const entry = createMockEntry({
        error: {
          name: "TestError",
          message: "Test error",
          stack: "Error stack",
        },
      });
      const output = formatter.format(entry);

      expect(output).toContain("Test error");
    });

    it("should pretty print context when enabled", () => {
      const formatter = new ConsoleFormatter({
        colorize: false,
        prettyPrint: true,
      });
      const entry = createMockEntry({
        context: { userId: "123" },
      });
      const output = formatter.format(entry);

      expect(output).toContain('\n{\n  "userId": "123"\n}');
    });

    it("should pretty print error stack when enabled", () => {
      const formatter = new ConsoleFormatter({
        colorize: false,
        prettyPrint: true,
      });
      const entry = createMockEntry({
        error: {
          name: "TestError",
          message: "Test error",
          stack: "Error\n  at line 1",
        },
      });
      const output = formatter.format(entry);

      expect(output).toContain("\nError\n  at line 1");
    });

    it("should colorize levels when enabled", () => {
      const formatter = new ConsoleFormatter({ colorize: true });
      const errorEntry = createMockEntry({ level: "error" });
      const output = formatter.format(errorEntry);

      expect(output).toContain("\x1b[31m[ERROR]\x1b[0m");
    });

    it("should handle all log levels", () => {
      const formatter = new ConsoleFormatter({
        colorize: false,
        includeTimestamp: false,
      });
      const levels: LogLevelNames[] = [
        "trace",
        "debug",
        "info",
        "warn",
        "error",
      ];

      levels.forEach((level) => {
        const entry = createMockEntry({ level });
        const output = formatter.format(entry);
        expect(output).toContain(`[${level.toUpperCase()}]`);
      });
    });

    it("should exclude timestamp when disabled", () => {
      const formatter = new ConsoleFormatter({
        includeTimestamp: false,
        colorize: false,
      });
      const entry = createMockEntry();
      const output = formatter.format(entry);

      expect(output).not.toContain("[2025-01-01T00:00:00.000Z]");
      expect(output).toContain("[INFO] Test message");
    });

    it("should exclude context when disabled", () => {
      const formatter = new ConsoleFormatter({
        includeContext: false,
        colorize: false,
      });
      const entry = createMockEntry({
        context: { userId: "123" },
      });
      const output = formatter.format(entry);

      expect(output).not.toContain("userId");
      expect(output).toBe("[2025-01-01T00:00:00.000Z] [INFO] Test message");
    });

    it("should handle empty context", () => {
      const formatter = new ConsoleFormatter({ colorize: false });
      const entry = createMockEntry({ context: {} });
      const output = formatter.format(entry);

      expect(output).toBe("[2025-01-01T00:00:00.000Z] [INFO] Test message");
    });

    it("should handle undefined context", () => {
      const formatter = new ConsoleFormatter({ colorize: false });
      const entry = createMockEntry({ context: undefined });
      const output = formatter.format(entry);

      expect(output).toBe("[2025-01-01T00:00:00.000Z] [INFO] Test message");
    });

    it("should handle error objects with message property", () => {
      const formatter = new ConsoleFormatter({ colorize: false });
      const entry = createMockEntry({
        error: { name: "Error", message: "Error message" },
      });
      const output = formatter.format(entry);

      expect(output).toContain("Error message");
    });
  });

  describe("color mapping", () => {
    it("should apply correct colors for each level", () => {
      const formatter = new ConsoleFormatter({ colorize: true });

      const colorTests: Array<{ level: LogLevelNames; expectedColor: string }> =
        [
          { level: "trace", expectedColor: "\x1b[90m" }, // gray
          { level: "debug", expectedColor: "\x1b[36m" }, // cyan
          { level: "info", expectedColor: "\x1b[32m" }, // green
          { level: "warn", expectedColor: "\x1b[33m" }, // yellow
          { level: "error", expectedColor: "\x1b[31m" }, // red
        ];

      colorTests.forEach(({ level, expectedColor }) => {
        const entry = createMockEntry({ level });
        const output = formatter.format(entry);
        expect(output).toContain(
          `${expectedColor}[${level.toUpperCase()}]\x1b[0m`,
        );
      });
    });
  });
});
