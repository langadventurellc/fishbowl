# Fishbowl Structured Logging System

A comprehensive logging system for the Fishbowl monorepo that provides structured JSON logging with context management, multiple transports, formatters, and automatic platform detection.

## Table of Contents

- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Context Management](#context-management)
- [Transports and Formatters](#transports-and-formatters)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)
- [Migration Guide](#migration-guide)

## Quick Start

### Basic Usage

```typescript
import { createLogger } from "@fishbowl-ai/shared/logging";

// Create an async logger (recommended - includes device info)
const logger = await createLogger({
  config: { name: "my-service", level: "info" },
});

// Basic logging
logger.info("Application started", { port: 3000 });
logger.warn("Rate limit approaching", { requestCount: 95 });
logger.error("Database error", dbError, { operation: "findUser" });

// Create a synchronous logger (faster startup)
const syncLogger = createLoggerSync({
  config: { name: "startup-service", level: "debug" },
});
```

### Child Loggers

Child loggers inherit parent configuration and add additional context:

```typescript
// Parent logger
const logger = await createLogger({ config: { name: "api-server" } });

// Child logger for specific request
const requestLogger = logger.child({
  requestId: "req-123",
  userId: "456",
});

requestLogger.info("Processing login");
// Automatically includes requestId and userId in all log entries
```

## API Reference

### Factory Functions

| Function                     | Description                              | Use Case                              |
| ---------------------------- | ---------------------------------------- | ------------------------------------- |
| `createLogger(options?)`     | Async logger creation with device info   | Recommended for most use cases        |
| `createLoggerSync(options?)` | Sync logger creation without device info | Fast startup, testing, error handlers |

### Logger Methods

| Method                          | Level | Description                                 |
| ------------------------------- | ----- | ------------------------------------------- |
| `trace(message, data?)`         | TRACE | Most verbose - detailed diagnostic info     |
| `debug(message, data?)`         | DEBUG | Development diagnostic information          |
| `info(message, data?)`          | INFO  | General application flow information        |
| `warn(message, data?)`          | WARN  | Warning conditions, non-critical issues     |
| `error(message, error?, data?)` | ERROR | Error conditions with optional Error object |
| `fatal(message, error?, data?)` | FATAL | Critical errors (mapped to ERROR level)     |

### Configuration Methods

| Method                       | Description                                 |
| ---------------------------- | ------------------------------------------- |
| `setLevel(level)`            | Set minimum log level                       |
| `getLevel()`                 | Get current log level                       |
| `child(context)`             | Create child logger with additional context |
| `addTransport(transport)`    | Add output transport                        |
| `removeTransport(transport)` | Remove output transport                     |
| `setFormatter(formatter)`    | Set log entry formatter                     |

## Configuration

### Environment-Based Defaults

The logging system automatically configures itself based on `NODE_ENV`:

| Environment     | Level   | Device Info | Console Output |
| --------------- | ------- | ----------- | -------------- |
| **development** | `debug` | ✅ Enabled  | 🎨 Colorized   |
| **production**  | `warn`  | ❌ Disabled | 📋 JSON        |
| **test**        | `error` | ❌ Disabled | 🔇 Minimal     |

### Custom Configuration

```typescript
const logger = await createLogger({
  config: {
    name: "my-service", // Logger namespace
    level: "info", // Minimum log level
    includeDeviceInfo: true, // Include system/device info
    transports: [
      // Custom transports
      {
        type: "console",
        options: { colorize: true },
      },
    ],
    globalContext: {
      // Context for all log entries
      service: "user-auth",
      version: "1.2.3",
    },
  },
  context: {
    // Initial logger context
    component: "auth-handler",
  },
});
```

## Context Management

### Automatic Context

Every log entry automatically includes:

```json
{
  "timestamp": "2025-01-02T10:30:00.000Z",
  "level": "info",
  "message": "User logged in",
  "namespace": "user-service",
  "context": {
    "sessionId": "abc123def456", // Unique session ID
    "platform": "desktop", // desktop | mobile
    "metadata": {
      "process": {
        "pid": 12345,
        "platform": "darwin",
        "nodeVersion": "20.10.0"
      }
    }
  }
}
```

### Device Information (Async Logger Only)

When `includeDeviceInfo: true` and using `createLogger()`:

```json
{
  "context": {
    "deviceInfo": {
      "arch": "arm64",
      "cpus": 8,
      "totalMemory": 17179869184,
      "freeMemory": 8589934592,
      "uptime": 1234567
    }
  }
}
```

### Adding Custom Context

```typescript
// Global context (applies to all loggers from this config)
const logger = await createLogger({
  config: {
    globalContext: {
      service: "user-auth",
      version: "1.2.3",
      environment: "staging",
    },
  },
});

// Instance context (applies to this logger and its children)
const contextLogger = await createLogger({
  context: {
    requestId: "req-123",
    userId: "456",
  },
});

// Child context (additive to parent context)
const childLogger = logger.child({
  component: "password-validator",
  step: "strength-check",
});
```

## Transports and Formatters

### Built-in Transports

| Transport          | Description               | Use Case               |
| ------------------ | ------------------------- | ---------------------- |
| `ConsoleTransport` | Outputs to console/stdout | Development, debugging |

### Built-in Formatters

| Formatter          | Description                   | Output                                     |
| ------------------ | ----------------------------- | ------------------------------------------ |
| `SimpleFormatter`  | Basic JSON formatting         | `{"timestamp":"...", "level":"info", ...}` |
| `ConsoleFormatter` | Human-readable console output | `[INFO] 10:30:00 - Message {data}`         |

### Custom Transport Example

```typescript
import { ConsoleTransport, SimpleFormatter } from "@fishbowl-ai/shared/logging";

const logger = await createLogger({
  config: {
    transports: [
      {
        type: "console",
        options: {
          formatter: new SimpleFormatter(),
          colorize: false,
        },
      },
    ],
  },
});

// Add transport after creation
logger.addTransport(new ConsoleTransport({ colorize: true }));
```

## Error Handling

### Error Object Serialization

The logging system automatically serializes Error objects:

```typescript
try {
  await riskyOperation();
} catch (error) {
  // Error object is automatically serialized with stack trace
  logger.error("Operation failed", error, {
    operation: "user-creation",
    userId: "123",
  });
}
```

### Error Log Entry Structure

```json
{
  "level": "error",
  "message": "Database connection failed",
  "error": {
    "name": "ConnectionError",
    "message": "Connection timeout after 5000ms",
    "stack": "ConnectionError: Connection timeout...\n    at Database.connect...",
    "code": "CONN_TIMEOUT"
  },
  "data": {
    "retryCount": 3,
    "host": "db.example.com"
  }
}
```

## Best Practices

### 1. Use Appropriate Log Levels

```typescript
// ✅ Good: Appropriate levels
logger.debug("Cache hit", { key: "user:123" }); // Development info
logger.info("User logged in", { userId: "123" }); // Important events
logger.warn("Rate limit approaching", { count: 95 }); // Potential issues
logger.error("Payment failed", error, { orderId: "456" }); // Errors

// ❌ Avoid: Wrong levels
logger.error("User clicked button"); // Not an error
logger.info("Detailed debug info"); // Too verbose for info
```

### 2. Provide Context

```typescript
// ✅ Good: Rich context
logger.info("Payment processed", {
  userId: "123",
  orderId: "456",
  amount: 99.99,
  currency: "USD",
  paymentMethod: "credit_card",
});

// ❌ Avoid: Missing context
logger.info("Payment processed");
```

### 3. Use Child Loggers for Request Tracking

```typescript
// ✅ Good: Request-scoped logging
export async function handleUserRequest(req, res) {
  const requestLogger = logger.child({
    requestId: req.id,
    userId: req.user?.id,
    endpoint: req.path,
  });

  requestLogger.info("Request started");
  // ... request processing
  requestLogger.info("Request completed", { duration: 150 });
}

// ❌ Avoid: Manual context in every log call
logger.info("Request started", { requestId: req.id, userId: req.user?.id });
logger.info("Request completed", {
  requestId: req.id,
  userId: req.user?.id,
  duration: 150,
});
```

### 4. Error Logging Patterns

```typescript
// ✅ Good: Comprehensive error logging
try {
  await processPayment(order);
} catch (error) {
  logger.error("Payment processing failed", error, {
    orderId: order.id,
    userId: order.userId,
    amount: order.total,
    paymentMethod: order.paymentMethod,
    retryable: error.code === "TEMPORARY_FAILURE",
  });
  throw error; // Re-throw if needed
}

// ✅ Good: Validation errors
if (!email.includes("@")) {
  logger.warn("Invalid email provided", {
    email: email.substring(0, 5) + "***", // Avoid logging PII
    userId: user.id,
  });
  throw new ValidationError("Invalid email");
}
```

### 5. Performance Considerations

```typescript
// ✅ Good: Use sync logger for startup
const startupLogger = createLoggerSync({
  config: { name: "startup", level: "info" },
});
startupLogger.info("Application initializing...");

// ✅ Good: Use async logger for main app
const appLogger = await createLogger({
  config: { name: "app", level: "info", includeDeviceInfo: true },
});

// ✅ Good: Conditional verbose logging
if (logger.getLevel() === "debug") {
  logger.debug("Expensive operation details", computeExpensiveData());
}
```
