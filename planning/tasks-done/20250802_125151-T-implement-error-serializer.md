---
kind: task
id: T-implement-error-serializer
status: done
title: Implement error serializer utility with unit tests
priority: high
prerequisites:
  - T-create-logging-folder-structure
created: "2025-08-02T11:48:02.312727"
updated: "2025-08-02T12:36:26.509421"
schema_version: "1.1"
worktree: null
---

## Implement error serializer utility with unit tests

### Context

Create a utility function that serializes Error objects into a structured format suitable for logging. This ensures error information is captured consistently and can be properly logged as JSON.

### Implementation Requirements

1. Serialize standard Error properties (message, stack, name)
2. Handle custom error properties
3. Handle circular references safely
4. Support nested errors (cause property)
5. Write comprehensive unit tests

### Technical Approach

#### File: packages/shared/src/logging/utils/errorSerializer.ts

```typescript
import type { ErrorInfo } from "../types";

export function serializeError(error: Error | unknown): ErrorInfo {
  // Handle non-Error objects
  if (!(error instanceof Error)) {
    return {
      message: String(error),
      name: "UnknownError",
    };
  }

  // Start with basic error properties
  const serialized: ErrorInfo = {
    message: error.message,
    name: error.name,
  };

  // Add stack trace if available
  if (error.stack) {
    serialized.stack = error.stack;
  }

  // Add error code if present (common in Node.js errors)
  if ("code" in error && typeof error.code === "string") {
    serialized.code = error.code;
  }

  // Handle error cause (ES2022+)
  if ("cause" in error && error.cause) {
    serialized.cause = serializeError(error.cause);
  }

  // Add any custom properties (avoiding circular references)
  const seen = new WeakSet();
  for (const key in error) {
    if (
      error.hasOwnProperty(key) &&
      !["name", "message", "stack", "code", "cause"].includes(key)
    ) {
      try {
        const value = (error as any)[key];

        // Skip functions and circular references
        if (typeof value === "function") continue;
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) continue;
          seen.add(value);
        }

        // Simple JSON serialization check
        JSON.stringify(value);
        serialized[key] = value;
      } catch {
        // Skip non-serializable values
      }
    }
  }

  return serialized;
}
```

#### File: packages/shared/src/logging/utils/**tests**/errorSerializer.test.ts

```typescript
import { serializeError } from "../errorSerializer";

describe("serializeError", () => {
  it("should serialize basic Error properties", () => {
    const error = new Error("Test error message");
    const result = serializeError(error);

    expect(result).toMatchObject({
      message: "Test error message",
      name: "Error",
    });
    expect(result.stack).toBeDefined();
    expect(result.stack).toContain("Test error message");
  });

  it("should handle TypeError", () => {
    const error = new TypeError("Type mismatch");
    const result = serializeError(error);

    expect(result).toMatchObject({
      message: "Type mismatch",
      name: "TypeError",
    });
  });

  it("should serialize custom error properties", () => {
    const error = new Error("Custom error") as any;
    error.statusCode = 404;
    error.endpoint = "/api/users";
    error.timestamp = "2025-01-01T00:00:00.000Z";

    const result = serializeError(error);

    expect(result).toMatchObject({
      message: "Custom error",
      name: "Error",
      statusCode: 404,
      endpoint: "/api/users",
      timestamp: "2025-01-01T00:00:00.000Z",
    });
  });

  it("should handle error with code property", () => {
    const error = new Error("File not found") as any;
    error.code = "ENOENT";

    const result = serializeError(error);

    expect(result).toMatchObject({
      message: "File not found",
      code: "ENOENT",
    });
  });

  it("should handle error cause (nested errors)", () => {
    const cause = new Error("Original error");
    const error = new Error("Wrapped error", { cause });

    const result = serializeError(error);

    expect(result).toMatchObject({
      message: "Wrapped error",
      name: "Error",
      cause: {
        message: "Original error",
        name: "Error",
      },
    });
  });

  it("should handle non-Error objects", () => {
    expect(serializeError("string error")).toEqual({
      message: "string error",
      name: "UnknownError",
    });

    expect(serializeError(123)).toEqual({
      message: "123",
      name: "UnknownError",
    });

    expect(serializeError(null)).toEqual({
      message: "null",
      name: "UnknownError",
    });

    expect(serializeError(undefined)).toEqual({
      message: "undefined",
      name: "UnknownError",
    });
  });

  it("should skip function properties", () => {
    const error = new Error("Error with function") as any;
    error.callback = () => {};
    error.data = "test";

    const result = serializeError(error);

    expect(result).toMatchObject({
      message: "Error with function",
      data: "test",
    });
    expect(result.callback).toBeUndefined();
  });

  it("should handle circular references", () => {
    const error = new Error("Circular error") as any;
    const circularObj = { error: null as any };
    circularObj.error = circularObj;
    error.circular = circularObj;

    // Should not throw
    expect(() => serializeError(error)).not.toThrow();

    const result = serializeError(error);
    expect(result.message).toBe("Circular error");
  });

  it("should handle non-serializable values", () => {
    const error = new Error("Complex error") as any;
    error.bigint = BigInt(123);
    error.symbol = Symbol("test");
    error.validData = "test";

    const result = serializeError(error);

    expect(result).toMatchObject({
      message: "Complex error",
      validData: "test",
    });
    expect(result.bigint).toBeUndefined();
    expect(result.symbol).toBeUndefined();
  });

  it("should handle deeply nested cause chain", () => {
    const rootCause = new Error("Root cause");
    const middleError = new Error("Middle error", { cause: rootCause });
    const topError = new Error("Top error", { cause: middleError });

    const result = serializeError(topError);

    expect(result.message).toBe("Top error");
    expect(result.cause?.message).toBe("Middle error");
    expect(result.cause?.cause?.message).toBe("Root cause");
  });
});
```

#### File: packages/shared/src/logging/utils/index.ts (update)

```typescript
export { detectPlatform } from "./platform";
export type { Platform } from "./platform";
export { serializeError } from "./errorSerializer";
```

### Acceptance Criteria

- [ ] Basic Error properties are serialized (message, name, stack)
- [ ] Custom error properties are captured
- [ ] Error code property is handled correctly
- [ ] Nested errors (cause) are serialized recursively
- [ ] Non-Error objects are handled gracefully
- [ ] Circular references don't cause infinite loops
- [ ] Non-serializable values are skipped
- [ ] Unit tests achieve 100% code coverage
- [ ] TypeScript compilation succeeds
- [ ] `pnpm quality` passes without issues

### Testing Requirements

- Test standard Error serialization
- Test different Error types (TypeError, RangeError, etc.)
- Test custom error properties
- Test error code handling (Node.js style)
- Test error cause chains
- Test non-Error object handling
- Test circular reference handling
- Test non-serializable value filtering
- Test deeply nested error causes

### Log

**2025-08-02T17:51:51.945491Z** - Successfully implemented error serializer utility with comprehensive unit tests for the Fishbowl logging system.

The serializeError function converts JavaScript Error objects into structured ErrorInfo objects suitable for JSON logging. Key features implemented:

1. **Standard Error Properties**: Serializes message, name, stack traces for all Error types
2. **Custom Properties**: Captures additional properties from custom Error classes and Node.js errors
3. **Circular Reference Handling**: Uses WeakSet to detect and safely handle circular references
4. **Nested Error Causes**: Recursively serializes error cause chains (ES2022+ support)
5. **Smart Code Property Handling**: Node.js-style error codes go to top-level, custom Error class codes go to metadata
6. **Type Safety**: Avoids 'any' types, uses proper TypeScript typing throughout
7. **Non-serializable Value Filtering**: Skips functions, symbols, and values that can't be JSON serialized

The implementation includes 19 comprehensive unit tests covering all scenarios including edge cases, circular references, custom Error classes, and deeply nested error causes. All tests pass with 100% coverage.

Quality checks passed: linting, formatting, type checking, and full test suite. Shared package successfully built and ready for use by logging system components.

- filesChanged: ["packages/shared/src/logging/utils/errorSerializer.ts", "packages/shared/src/logging/utils/__tests__/errorSerializer.test.ts", "packages/shared/src/logging/utils/index.ts"]
