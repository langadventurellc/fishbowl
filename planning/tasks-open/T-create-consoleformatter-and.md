---
kind: task
id: T-create-consoleformatter-and
title: Create ConsoleFormatter and ConsoleTransport with unit tests
status: open
priority: normal
prerequisites:
  - T-create-logging-folder-structure
created: "2025-08-02T11:50:10.982766"
updated: "2025-08-02T11:50:10.982766"
schema_version: "1.1"
---

## Create ConsoleFormatter and ConsoleTransport with unit tests

### Context

Implement the console formatter that formats log entries for console output and the console transport that routes log entries to the console. These are the primary output mechanisms for the logging system.

### Implementation Requirements

1. Create ConsoleFormatter that formats LogEntry objects into readable console strings
2. Create ConsoleTransport that uses the formatter and outputs to console
3. Support different output methods based on log level (console.log, console.warn, console.error)
4. Handle both simple and pretty formatting options
5. Write comprehensive unit tests

### Technical Approach

#### File: packages/shared/src/logging/formatters/ConsoleFormatter.ts

```typescript
import type { Formatter, LogEntry } from "../types";

export interface ConsoleFormatterOptions {
  colorize?: boolean;
  includeTimestamp?: boolean;
  includeContext?: boolean;
  prettyPrint?: boolean;
}

export class ConsoleFormatter implements Formatter {
  private options: ConsoleFormatterOptions;

  constructor(options: ConsoleFormatterOptions = {}) {
    this.options = {
      colorize: false, // Colors don't work well in all environments
      includeTimestamp: true,
      includeContext: true,
      prettyPrint: false,
      ...options,
    };
  }

  format(entry: LogEntry): string {
    const parts: string[] = [];

    // Add timestamp
    if (this.options.includeTimestamp) {
      parts.push(`[${entry.timestamp}]`);
    }

    // Add level
    parts.push(entry.level.toUpperCase());

    // Add message
    parts.push(entry.message);

    // Add context if present
    if (
      this.options.includeContext &&
      entry.context &&
      Object.keys(entry.context).length > 0
    ) {
      if (this.options.prettyPrint) {
        parts.push("\n" + JSON.stringify(entry.context, null, 2));
      } else {
        parts.push(JSON.stringify(entry.context));
      }
    }

    return parts.join(" ");
  }
}

// Simple formatter for basic output
export class SimpleFormatter implements Formatter {
  format(entry: LogEntry): string {
    const { level, message, context } = entry;
    const contextStr =
      context && Object.keys(context).length
        ? ` ${JSON.stringify(context)}`
        : "";

    return `${level.toUpperCase()}: ${message}${contextStr}`;
  }
}
```

#### File: packages/shared/src/logging/formatters/index.ts

```typescript
export { ConsoleFormatter, SimpleFormatter } from "./ConsoleFormatter";
export type { ConsoleFormatterOptions } from "./ConsoleFormatter";
```

#### File: packages/shared/src/logging/transports/ConsoleTransport.ts

```typescript
import log from "loglevel";
import type { Transport, LogEntry, Formatter } from "../types";
import { SimpleFormatter } from "../formatters/ConsoleFormatter";

export interface ConsoleTransportOptions {
  formatter?: Formatter;
  minLevel?: string;
}

export class ConsoleTransport implements Transport {
  private formatter: Formatter;
  private minLevel: log.LogLevelNumbers;

  constructor(options: ConsoleTransportOptions = {}) {
    this.formatter = options.formatter || new SimpleFormatter();
    this.minLevel = this.getLevelNumber(options.minLevel || "info");
  }

  private getLevelNumber(level: string): log.LogLevelNumbers {
    const levels: Record<string, log.LogLevelNumbers> = {
      trace: log.levels.TRACE,
      debug: log.levels.DEBUG,
      info: log.levels.INFO,
      warn: log.levels.WARN,
      error: log.levels.ERROR,
    };
    return levels[level.toLowerCase()] || log.levels.INFO;
  }

  private getLogLevelNumber(level: string): log.LogLevelNumbers {
    return this.getLevelNumber(level);
  }

  log(entry: LogEntry): void {
    // Check if entry meets minimum level requirement
    const entryLevel = this.getLogLevelNumber(entry.level);
    if (entryLevel < this.minLevel) {
      return;
    }

    const formatted = this.formatter.format(entry);

    // Use appropriate console method based on level
    switch (entry.level.toLowerCase()) {
      case "error":
        console.error(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      case "debug":
      case "trace":
        console.debug(formatted);
        break;
      default:
        console.log(formatted);
    }
  }
}
```

#### File: packages/shared/src/logging/transports/index.ts

```typescript
export { ConsoleTransport } from "./ConsoleTransport";
export type { ConsoleTransportOptions } from "./ConsoleTransport";
```

#### File: packages/shared/src/logging/formatters/**tests**/ConsoleFormatter.test.ts

```typescript
import { ConsoleFormatter, SimpleFormatter } from "../ConsoleFormatter";
import type { LogEntry } from "../../types";

describe("ConsoleFormatter", () => {
  const mockEntry: LogEntry = {
    timestamp: "2025-01-01T00:00:00.000Z",
    level: "info",
    message: "Test message",
    context: { userId: 123, action: "login" },
    platform: "web",
    environment: "development",
    sessionId: "test-session",
    version: "1.0.0",
  };

  describe("with default options", () => {
    it("should format log entry with timestamp and context", () => {
      const formatter = new ConsoleFormatter();
      const result = formatter.format(mockEntry);

      expect(result).toBe(
        '[2025-01-01T00:00:00.000Z] INFO Test message {"userId":123,"action":"login"}',
      );
    });
  });

  describe("with custom options", () => {
    it("should exclude timestamp when disabled", () => {
      const formatter = new ConsoleFormatter({ includeTimestamp: false });
      const result = formatter.format(mockEntry);

      expect(result).toBe('INFO Test message {"userId":123,"action":"login"}');
    });

    it("should exclude context when disabled", () => {
      const formatter = new ConsoleFormatter({ includeContext: false });
      const result = formatter.format(mockEntry);

      expect(result).toBe("[2025-01-01T00:00:00.000Z] INFO Test message");
    });

    it("should pretty print context when enabled", () => {
      const formatter = new ConsoleFormatter({ prettyPrint: true });
      const result = formatter.format(mockEntry);

      expect(result).toContain("INFO Test message");
      expect(result).toContain("\n{");
      expect(result).toContain('"userId": 123');
      expect(result).toContain('"action": "login"');
    });
  });

  it("should handle empty context", () => {
    const formatter = new ConsoleFormatter();
    const entryNoContext = { ...mockEntry, context: {} };
    const result = formatter.format(entryNoContext);

    expect(result).toBe("[2025-01-01T00:00:00.000Z] INFO Test message");
  });

  it("should handle undefined context", () => {
    const formatter = new ConsoleFormatter();
    const entryNoContext = { ...mockEntry, context: undefined };
    const result = formatter.format(entryNoContext);

    expect(result).toBe("[2025-01-01T00:00:00.000Z] INFO Test message");
  });
});

describe("SimpleFormatter", () => {
  it("should format with minimal output", () => {
    const formatter = new SimpleFormatter();
    const entry: LogEntry = {
      timestamp: "2025-01-01T00:00:00.000Z",
      level: "error",
      message: "Error occurred",
      context: { code: "ERR_001" },
      platform: "web",
      environment: "production",
      sessionId: "test",
      version: "1.0.0",
    };

    const result = formatter.format(entry);
    expect(result).toBe('ERROR: Error occurred {"code":"ERR_001"}');
  });

  it("should handle empty context", () => {
    const formatter = new SimpleFormatter();
    const entry: LogEntry = {
      timestamp: "2025-01-01T00:00:00.000Z",
      level: "info",
      message: "Simple message",
      platform: "web",
      environment: "development",
      sessionId: "test",
      version: "1.0.0",
    };

    const result = formatter.format(entry);
    expect(result).toBe("INFO: Simple message");
  });
});
```

#### File: packages/shared/src/logging/transports/**tests**/ConsoleTransport.test.ts

```typescript
import { ConsoleTransport } from "../ConsoleTransport";
import { SimpleFormatter } from "../../formatters/ConsoleFormatter";
import type { LogEntry } from "../../types";

describe("ConsoleTransport", () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleDebugSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    consoleDebugSpy = jest.spyOn(console, "debug").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createMockEntry = (level: string, message: string): LogEntry => ({
    timestamp: "2025-01-01T00:00:00.000Z",
    level,
    message,
    platform: "web",
    environment: "test",
    sessionId: "test-session",
    version: "1.0.0",
  });

  it("should use correct console method for each log level", () => {
    const transport = new ConsoleTransport();

    transport.log(createMockEntry("info", "Info message"));
    expect(consoleLogSpy).toHaveBeenCalledWith("INFO: Info message");

    transport.log(createMockEntry("warn", "Warning message"));
    expect(consoleWarnSpy).toHaveBeenCalledWith("WARN: Warning message");

    transport.log(createMockEntry("error", "Error message"));
    expect(consoleErrorSpy).toHaveBeenCalledWith("ERROR: Error message");

    transport.log(createMockEntry("debug", "Debug message"));
    expect(consoleDebugSpy).toHaveBeenCalledWith("DEBUG: Debug message");

    transport.log(createMockEntry("trace", "Trace message"));
    expect(consoleDebugSpy).toHaveBeenCalledWith("TRACE: Trace message");
  });

  it("should respect minimum log level", () => {
    const transport = new ConsoleTransport({ minLevel: "warn" });

    transport.log(createMockEntry("debug", "Debug message"));
    transport.log(createMockEntry("info", "Info message"));
    expect(consoleLogSpy).not.toHaveBeenCalled();
    expect(consoleDebugSpy).not.toHaveBeenCalled();

    transport.log(createMockEntry("warn", "Warning message"));
    expect(consoleWarnSpy).toHaveBeenCalled();

    transport.log(createMockEntry("error", "Error message"));
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("should use custom formatter when provided", () => {
    const mockFormatter = {
      format: jest.fn().mockReturnValue("CUSTOM FORMAT"),
    };

    const transport = new ConsoleTransport({ formatter: mockFormatter });
    const entry = createMockEntry("info", "Test");

    transport.log(entry);

    expect(mockFormatter.format).toHaveBeenCalledWith(entry);
    expect(consoleLogSpy).toHaveBeenCalledWith("CUSTOM FORMAT");
  });

  it("should handle case-insensitive log levels", () => {
    const transport = new ConsoleTransport();

    transport.log(createMockEntry("INFO", "Upper case info"));
    expect(consoleLogSpy).toHaveBeenCalled();

    transport.log(createMockEntry("Error", "Mixed case error"));
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("should default to info level when invalid minLevel provided", () => {
    const transport = new ConsoleTransport({ minLevel: "invalid" as any });

    transport.log(createMockEntry("debug", "Debug message"));
    expect(consoleDebugSpy).not.toHaveBeenCalled();

    transport.log(createMockEntry("info", "Info message"));
    expect(consoleLogSpy).toHaveBeenCalled();
  });
});
```

### Acceptance Criteria

- [ ] ConsoleFormatter formats LogEntry objects into readable strings
- [ ] ConsoleFormatter supports configurable options (timestamp, context, pretty print)
- [ ] SimpleFormatter provides minimal formatting option
- [ ] ConsoleTransport routes logs to appropriate console methods
- [ ] Transport respects minimum log level filtering
- [ ] Custom formatters can be provided to transport
- [ ] Unit tests achieve 100% code coverage
- [ ] TypeScript compilation succeeds
- [ ] `pnpm quality` passes without issues

### Testing Requirements

- Test all formatter options and combinations
- Test handling of empty/undefined context
- Test all log levels route to correct console methods
- Test minimum level filtering
- Test custom formatter integration
- Test case-insensitive level handling
- Verify formatted output structure

### Log
