import { SimpleFormatter } from "../SimpleFormatter";
import type { LogEntry } from "../../types";
import type { LogLevelNames } from "loglevel";

describe("SimpleFormatter", () => {
  const createMockEntry = (overrides: Partial<LogEntry> = {}): LogEntry => ({
    timestamp: "2025-01-01T00:00:00.000Z",
    level: "info",
    message: "Test message",
    namespace: "test",
    ...overrides,
  });

  it("should format basic log entry without timestamp", () => {
    const formatter = new SimpleFormatter();
    const entry = createMockEntry();
    const output = formatter.format(entry);

    expect(output).toBe("[INFO] Test message");
  });

  it("should include context when present", () => {
    const formatter = new SimpleFormatter();
    const entry = createMockEntry({
      context: { userId: "123", metadata: { action: "login" } },
    });
    const output = formatter.format(entry);

    expect(output).toContain("[INFO] Test message");
    expect(output).toContain('"userId":"123"');
    expect(output).toContain('"action":"login"');
  });

  it("should include error message when present", () => {
    const formatter = new SimpleFormatter();
    const entry = createMockEntry({
      error: { name: "TestError", message: "Test error" },
    });
    const output = formatter.format(entry);

    expect(output).toBe("[INFO] Test message Test error");
  });

  it("should not include empty context", () => {
    const formatter = new SimpleFormatter();
    const entry = createMockEntry({
      context: {},
    });
    const output = formatter.format(entry);

    expect(output).toBe("[INFO] Test message");
  });

  it("should handle undefined context", () => {
    const formatter = new SimpleFormatter();
    const entry = createMockEntry({
      context: undefined,
    });
    const output = formatter.format(entry);

    expect(output).toBe("[INFO] Test message");
  });

  it("should handle undefined error", () => {
    const formatter = new SimpleFormatter();
    const entry = createMockEntry({
      error: undefined,
    });
    const output = formatter.format(entry);

    expect(output).toBe("[INFO] Test message");
  });

  it("should format all log levels correctly", () => {
    const formatter = new SimpleFormatter();
    const levels: LogLevelNames[] = ["trace", "debug", "info", "warn", "error"];

    levels.forEach((level) => {
      const entry = createMockEntry({
        level,
        message: `${level} message`,
      });
      const output = formatter.format(entry);
      expect(output).toBe(`[${level.toUpperCase()}] ${level} message`);
    });
  });

  it("should handle complex context with nested objects", () => {
    const formatter = new SimpleFormatter();
    const entry = createMockEntry({
      context: {
        userId: "123",
        metadata: {
          nested: {
            deeply: {
              value: "test",
            },
          },
        },
      },
    });
    const output = formatter.format(entry);

    expect(output).toContain("[INFO] Test message");
    expect(output).toContain('"userId":"123"');
    expect(output).toContain('"nested":{"deeply":{"value":"test"}}');
  });

  it("should handle error with only message property", () => {
    const formatter = new SimpleFormatter();
    const entry = createMockEntry({
      error: { name: "Error", message: "Simple error message" },
    });
    const output = formatter.format(entry);

    expect(output).toBe("[INFO] Test message Simple error message");
  });

  it("should handle both context and error", () => {
    const formatter = new SimpleFormatter();
    const entry = createMockEntry({
      context: { userId: "456" },
      error: { name: "ValidationError", message: "Validation failed" },
    });
    const output = formatter.format(entry);

    expect(output).toContain("[INFO] Test message");
    expect(output).toContain('"userId":"456"');
    expect(output).toContain("Validation failed");
  });
});
