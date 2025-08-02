---
kind: task
id: T-implement-structuredlogger-core
status: done
title: Implement StructuredLogger core class with unit tests
priority: high
prerequisites:
  - T-create-logging-folder-structure
  - T-implement-platform-detection
  - T-implement-error-serializer
created: "2025-08-02T11:49:01.712985"
updated: "2025-08-02T16:01:11.896531"
schema_version: "1.1"
worktree: null
---

## Implement StructuredLogger core class with unit tests

### Context

Create the core StructuredLogger class that wraps loglevel and provides structured logging capabilities. This is the main implementation that coordinates formatters, transports, and context management.

### Implementation Requirements

1. Create the StructuredLogger class implementing the StructuredLogger interface
2. Integrate with loglevel for base logging functionality
3. Implement context management (global and child contexts)
4. Implement timer functionality for performance tracking
5. Handle log entry creation and routing to transports
6. Write comprehensive unit tests

### Technical Approach

#### File: packages/shared/src/logging/StructuredLogger.ts

```typescript
import log from "loglevel";
import { v4 as uuidv4 } from "uuid";
import type {
  LogContext,
  LogEntry,
  StructuredLogger as IStructuredLogger,
  LogConfig,
  Formatter,
  Transport,
  ErrorInfo,
} from "./types";
import { detectPlatform } from "./utils/platform";
import { serializeError } from "./utils/errorSerializer";

export class StructuredLogger implements IStructuredLogger {
  private baseLogger: log.Logger;
  private globalContext: LogContext = {};
  private sessionId: string;
  private platform: string;
  private formatters: Formatter[] = [];
  private transports: Transport[] = [];

  constructor(config: LogConfig) {
    this.baseLogger = log.getLogger(config.name || "app");
    this.sessionId = uuidv4();
    this.platform = detectPlatform();
    this.setupLogLevel(config);
    this.initializeTransports(config);
  }

  private setupLogLevel(config: LogConfig): void {
    const level =
      config.level ||
      (process.env.NODE_ENV === "production" ? "info" : "debug");
    this.baseLogger.setLevel(level as log.LogLevelDesc);
  }

  private initializeTransports(config: LogConfig): void {
    // This will be implemented when transports are created
    // For now, store the config for later use
  }

  trace(message: string, context?: LogContext): void {
    this.log("trace", message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.log("debug", message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log("warn", message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const errorInfo = error ? serializeError(error) : undefined;
    this.log("error", message, { ...context, error: errorInfo });
  }

  private log(level: string, message: string, context?: LogContext): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.globalContext, ...context },
      platform: this.platform as any,
      environment: (process.env.NODE_ENV || "development") as any,
      sessionId: this.sessionId,
      version: process.env.APP_VERSION || "0.0.0",
    };

    // Send to all transports
    this.transports.forEach((transport) => transport.log(entry));

    // Fallback to console if no transports configured
    if (this.transports.length === 0) {
      const logMethod = this.baseLogger[level as keyof log.Logger];
      if (typeof logMethod === "function") {
        logMethod.call(this.baseLogger, message, entry.context);
      }
    }
  }

  child(context: LogContext): StructuredLogger {
    const childLogger = Object.create(this);
    childLogger.globalContext = { ...this.globalContext, ...context };
    return childLogger;
  }

  setContext(context: LogContext): void {
    this.globalContext = { ...this.globalContext, ...context };
  }

  startTimer(label: string): () => void {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.info(`Timer ${label}`, { duration_ms: duration, timer: label });
    };
  }

  addTransport(transport: Transport): void {
    this.transports.push(transport);
  }

  addFormatter(formatter: Formatter): void {
    this.formatters.push(formatter);
  }
}
```

#### File: packages/shared/src/logging/**tests**/StructuredLogger.test.ts

```typescript
import { StructuredLogger } from "../StructuredLogger";
import type { LogEntry, Transport } from "../types";

// Mock dependencies
jest.mock("uuid", () => ({
  v4: () => "test-session-id",
}));

jest.mock("../utils/platform", () => ({
  detectPlatform: () => "web",
}));

jest.mock("../utils/errorSerializer", () => ({
  serializeError: (error: Error) => ({
    message: error.message,
    stack: error.stack,
    name: error.name,
  }),
}));

describe("StructuredLogger", () => {
  let logger: StructuredLogger;
  let mockTransport: Transport;
  let capturedEntries: LogEntry[];

  beforeEach(() => {
    capturedEntries = [];
    mockTransport = {
      log: (entry: LogEntry) => {
        capturedEntries.push(entry);
      },
    };

    logger = new StructuredLogger({ name: "test" });
    logger.addTransport(mockTransport);

    // Set fixed date for tests
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("log levels", () => {
    it("should log info messages", () => {
      logger.info("test message", { userId: 123 });

      expect(capturedEntries).toHaveLength(1);
      expect(capturedEntries[0]).toMatchObject({
        level: "info",
        message: "test message",
        context: { userId: 123 },
        platform: "web",
        sessionId: "test-session-id",
      });
    });

    it("should log error messages with error details", () => {
      const error = new Error("Test error");
      logger.error("Error occurred", error, { action: "test" });

      expect(capturedEntries).toHaveLength(1);
      expect(capturedEntries[0]).toMatchObject({
        level: "error",
        message: "Error occurred",
        context: {
          action: "test",
          error: {
            message: "Test error",
            name: "Error",
          },
        },
      });
    });
  });

  describe("context management", () => {
    it("should include global context in all logs", () => {
      logger.setContext({ app: "test-app", version: "1.0.0" });
      logger.info("test message");

      expect(capturedEntries[0].context).toMatchObject({
        app: "test-app",
        version: "1.0.0",
      });
    });

    it("should create child logger with additional context", () => {
      logger.setContext({ app: "test-app" });
      const childLogger = logger.child({ module: "auth", userId: 123 });

      childLogger.info("child message");

      expect(capturedEntries[0].context).toMatchObject({
        app: "test-app",
        module: "auth",
        userId: 123,
      });
    });

    it("should not affect parent logger context", () => {
      logger.setContext({ app: "test-app" });
      const childLogger = logger.child({ module: "auth" });

      childLogger.info("child message");
      logger.info("parent message");

      expect(capturedEntries[0].context).toHaveProperty("module", "auth");
      expect(capturedEntries[1].context).not.toHaveProperty("module");
    });
  });

  describe("timer functionality", () => {
    it("should track timing and log duration", () => {
      const endTimer = logger.startTimer("test-operation");

      // Advance time by 1500ms
      jest.advanceTimersByTime(1500);

      endTimer();

      expect(capturedEntries).toHaveLength(1);
      expect(capturedEntries[0]).toMatchObject({
        level: "info",
        message: "Timer test-operation",
        context: {
          duration_ms: 1500,
          timer: "test-operation",
        },
      });
    });
  });

  describe("configuration", () => {
    it("should use custom logger name", () => {
      const customLogger = new StructuredLogger({ name: "custom-logger" });
      // Logger name is used internally by loglevel
      expect(customLogger).toBeDefined();
    });

    it("should handle no transports gracefully", () => {
      const consoleLogger = new StructuredLogger({ name: "console-test" });
      // Should not throw when logging without transports
      expect(() => consoleLogger.info("test")).not.toThrow();
    });
  });
});
```

### Acceptance Criteria

- [ ] StructuredLogger class implements all methods from the interface
- [ ] Context management works correctly (global and child contexts)
- [ ] Timer functionality tracks and logs duration accurately
- [ ] All log levels work correctly (trace, debug, info, warn, error)
- [ ] Error serialization is integrated for error logs
- [ ] Unit tests achieve 100% code coverage
- [ ] TypeScript compilation succeeds
- [ ] `pnpm quality` passes without issues

### Dependencies

- Requires platform detection utility to be implemented
- Requires error serializer utility to be implemented
- Requires TypeScript interfaces from previous task

### Testing Requirements

- Test all log levels produce correct LogEntry structure
- Test context merging (global, child, method-level)
- Test child logger isolation
- Test timer functionality with different durations
- Test error handling and serialization
- Test configuration options
- Verify transport routing works correctly

### Log

**2025-08-02T21:37:27.877367Z** - Successfully implemented StructuredLogger core class with comprehensive functionality including all interface methods, transport management, context handling, child logger creation, error serialization, and complete unit test coverage (37 tests passing). Fixed module-level mocking issues and ensured proper test isolation. All quality checks (lint, format, type-check) pass.

- filesChanged: ["packages/shared/src/logging/StructuredLogger.ts", "packages/shared/src/logging/__tests__/StructuredLogger.test.ts", "packages/shared/src/logging/index.ts"]
