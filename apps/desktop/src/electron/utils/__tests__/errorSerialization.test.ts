import { serializeError } from "../errorSerialization";
import { createSuccessResponse } from "../createSuccessResponse";
import { createErrorResponse } from "../createErrorResponse";
import {
  FileStorageError,
  FileNotFoundError,
  WritePermissionError,
  InvalidJsonError,
  SettingsValidationError,
  SchemaVersionError,
} from "@fishbowl-ai/shared";
import {
  LlmConfigError,
  ConfigNotFoundError,
  InvalidConfigError,
} from "../../services/errors";

// Mock process.env.NODE_ENV for testing
const originalNodeEnv = process.env.NODE_ENV;

describe("Error Serialization", () => {
  beforeEach(() => {
    // Reset NODE_ENV to production by default
    process.env.NODE_ENV = "production";
  });

  afterEach(() => {
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe("serializeError", () => {
    describe("Standard JavaScript Errors", () => {
      test("serializes basic Error object", () => {
        const error = new Error("Something went wrong");
        const result = serializeError(error);

        expect(result).toEqual({
          message: "Something went wrong",
          code: "Error",
        });
        expect(result.stack).toBeUndefined();
      });

      test("serializes TypeError with proper code", () => {
        const error = new TypeError("Invalid type");
        const result = serializeError(error);

        expect(result).toEqual({
          message: "Invalid type",
          code: "TypeError",
        });
      });

      test("serializes RangeError with proper code", () => {
        const error = new RangeError("Out of range");
        const result = serializeError(error);

        expect(result).toEqual({
          message: "Out of range",
          code: "RangeError",
        });
      });

      test("handles Error with no name property", () => {
        const error = new Error("No name error");
        // Remove name property to test fallback
        Object.defineProperty(error, "name", { value: "" });
        const result = serializeError(error);

        expect(result).toEqual({
          message: "No name error",
          code: "UNKNOWN_ERROR",
        });
      });
    });

    describe("Node.js System Errors", () => {
      test("maps ENOENT error code to FILE_NOT_FOUND", () => {
        const error = new Error("File not found") as any;
        error.code = "ENOENT";
        const result = serializeError(error);

        expect(result).toEqual({
          message: "File not found",
          code: "FILE_NOT_FOUND",
        });
      });

      test("maps EACCES error code to PERMISSION_DENIED", () => {
        const error = new Error("Permission denied") as any;
        error.code = "EACCES";
        const result = serializeError(error);

        expect(result).toEqual({
          message: "Permission denied",
          code: "PERMISSION_DENIED",
        });
      });

      test("maps EPERM error code to PERMISSION_DENIED", () => {
        const error = new Error("Operation not permitted") as any;
        error.code = "EPERM";
        const result = serializeError(error);

        expect(result).toEqual({
          message: "Operation not permitted",
          code: "PERMISSION_DENIED",
        });
      });

      test("maps ENOSPC error code to NO_SPACE", () => {
        const error = new Error("No space left") as any;
        error.code = "ENOSPC";
        const result = serializeError(error);

        expect(result).toEqual({
          message: "No space left",
          code: "NO_SPACE",
        });
      });

      test("maps EISDIR error code to IS_DIRECTORY", () => {
        const error = new Error("Is a directory") as any;
        error.code = "EISDIR";
        const result = serializeError(error);

        expect(result).toEqual({
          message: "Is a directory",
          code: "IS_DIRECTORY",
        });
      });
    });

    describe("Custom FileStorageError Types", () => {
      test("serializes FileNotFoundError", () => {
        const error = new FileNotFoundError("/path/to/file", "read");
        const result = serializeError(error);

        expect(result.code).toBe("FILE_NOT_FOUND");
        expect(result.message).toContain("file");
      });

      test("serializes WritePermissionError", () => {
        const error = new WritePermissionError("/path/to/file", "write");
        const result = serializeError(error);

        expect(result.code).toBe("PERMISSION_DENIED");
        expect(result.message).toContain("permission");
      });

      test("serializes InvalidJsonError", () => {
        const error = new InvalidJsonError(
          "/path/to/file",
          "parse",
          "Invalid JSON",
        );
        const result = serializeError(error);

        expect(result.code).toBe("INVALID_JSON");
        expect(result.message).toContain("JSON");
      });

      test("serializes SettingsValidationError", () => {
        const error = new SettingsValidationError("/path/to/file", "validate", [
          { path: "general.responseDelay", message: "Must be a number" },
        ]);
        const result = serializeError(error);

        expect(result.code).toBe("VALIDATION_FAILED");
        expect(result.message).toContain("validation failed");
      });

      test("serializes SchemaVersionError", () => {
        const error = new SchemaVersionError(
          "/path/to/file",
          "read",
          "1.0.0",
          "2.0.0",
        );
        const result = serializeError(error);

        expect(result.code).toBe("SCHEMA_VERSION_MISMATCH");
        expect(result.message).toContain("version mismatch");
      });

      test("serializes generic FileStorageError", () => {
        const error = new (class extends FileStorageError {
          constructor() {
            super("Generic file error", "test", "/path/to/file");
          }
        })();
        const result = serializeError(error);

        expect(result.code).toBe("FILE_STORAGE_ERROR");
        expect(result.message).toContain("file error");
      });
    });

    describe("Non-Error Types", () => {
      test("serializes string errors", () => {
        const result = serializeError("String error message");

        expect(result).toEqual({
          message: "String error message",
          code: "UNKNOWN_ERROR",
        });
      });

      test("serializes null values", () => {
        const result = serializeError(null);

        expect(result).toEqual({
          message: "An unknown error occurred",
          code: "UNKNOWN_ERROR",
        });
      });

      test("serializes undefined values", () => {
        const result = serializeError(undefined);

        expect(result).toEqual({
          message: "An unknown error occurred",
          code: "UNKNOWN_ERROR",
        });
      });

      test("serializes objects with message property", () => {
        const errorLike = { message: "Object with message" };
        const result = serializeError(errorLike);

        expect(result).toEqual({
          message: "Object with message",
          code: "UNKNOWN_ERROR",
        });
      });

      test("serializes number values", () => {
        const result = serializeError(42);

        expect(result).toEqual({
          message: "An unknown error occurred",
          code: "UNKNOWN_ERROR",
        });
      });

      test("serializes boolean values", () => {
        const result = serializeError(false);

        expect(result).toEqual({
          message: "An unknown error occurred",
          code: "UNKNOWN_ERROR",
        });
      });
    });

    describe("Message Sanitization", () => {
      test("removes absolute file paths from error messages", () => {
        const error = new Error(
          "Failed to read /usr/local/app/config/settings.json",
        );
        const result = serializeError(error);

        expect(result.message).toBe("Failed to read settings.json");
      });

      test("removes user-specific paths", () => {
        const error = new Error(
          "Cannot access /Users/john/Documents/app.config",
        );
        const result = serializeError(error);

        expect(result.message).toBe(
          "Cannot access <user-path>/Documents/app.config",
        );
      });

      test("removes home directory paths", () => {
        const error = new Error("Error in /home/alice/.config/app/settings");
        const result = serializeError(error);

        expect(result.message).toBe(
          "Error in <user-path>/.config/app/settings",
        );
      });

      test("preserves messages without sensitive paths", () => {
        const error = new Error("Simple error message");
        const result = serializeError(error);

        expect(result.message).toBe("Simple error message");
      });

      test("handles multiple path occurrences", () => {
        const error = new Error(
          "Failed to copy /Users/test/source.txt to /Users/test/dest.txt",
        );
        const result = serializeError(error);

        expect(result.message).toBe(
          "Failed to copy <user-path>/source.txt to <user-path>/dest.txt",
        );
      });
    });

    describe("Development Mode Stack Traces", () => {
      test("includes stack trace in development mode", () => {
        process.env.NODE_ENV = "development";

        const error = new Error("Test error");
        const result = serializeError(error);

        expect(result.message).toBe("Test error");
        expect(result.code).toBe("Error");
        expect(result.stack).toBeDefined();
        expect(typeof result.stack).toBe("string");
        expect(result.stack).toContain("Error: Test error");
      });

      test("excludes stack trace in production mode", () => {
        process.env.NODE_ENV = "production";

        const error = new Error("Test error");
        const result = serializeError(error);

        expect(result.message).toBe("Test error");
        expect(result.code).toBe("Error");
        expect(result.stack).toBeUndefined();
      });

      test("sanitizes stack traces in development mode", () => {
        process.env.NODE_ENV = "development";

        const error = new Error("Test error");
        // Simulate stack trace with user paths
        error.stack = `Error: Test error
    at test (/Users/john/app/test.js:1:1)
    at main (/home/alice/project/main.js:2:2)`;

        const result = serializeError(error);

        expect(result.stack).toContain("<user-path>");
        expect(result.stack).not.toContain("/Users/john");
        expect(result.stack).not.toContain("/home/alice");
      });

      test("handles errors without stack property", () => {
        process.env.NODE_ENV = "development";

        const error = new Error("Test error");
        // Remove stack property
        delete (error as any).stack;

        const result = serializeError(error);

        expect(result.message).toBe("Test error");
        expect(result.code).toBe("Error");
        expect(result.stack).toBeUndefined();
      });

      test("handles non-Error objects in development mode", () => {
        process.env.NODE_ENV = "development";

        const result = serializeError("String error");

        expect(result.message).toBe("String error");
        expect(result.code).toBe("UNKNOWN_ERROR");
        expect(result.stack).toBeUndefined();
      });
    });

    describe("Edge Cases", () => {
      test("handles circular reference objects gracefully", () => {
        const circular: any = { message: "Circular error" };
        circular.self = circular;

        const result = serializeError(circular);

        expect(result).toEqual({
          message: "Circular error",
          code: "UNKNOWN_ERROR",
        });
      });

      test("handles Error with custom properties", () => {
        const error = new Error("Custom error") as any;
        error.customProperty = "custom value";
        error.anotherProp = { nested: "object" };

        const result = serializeError(error);

        expect(result).toEqual({
          message: "Custom error",
          code: "Error",
        });
      });

      test("handles extremely long error messages", () => {
        const longMessage = "A".repeat(10000);
        const error = new Error(longMessage);

        const result = serializeError(error);

        expect(result.message).toBe(longMessage);
        expect(result.code).toBe("Error");
      });

      test("handles empty string messages", () => {
        const error = new Error("");
        const result = serializeError(error);

        expect(result).toEqual({
          message: "",
          code: "Error",
        });
      });

      test("handles whitespace-only messages", () => {
        const error = new Error("   ");
        const result = serializeError(error);

        expect(result).toEqual({
          message: "   ",
          code: "Error",
        });
      });
    });

    describe("Context Extraction", () => {
      test("extracts context from LlmConfigError", () => {
        const context = { configId: "test-123", provider: "openai" };
        const error = new LlmConfigError(
          "Test LLM error",
          "TEST_CODE",
          context,
        );
        const result = serializeError(error);

        expect(result.code).toBe("TEST_CODE");
        expect(result.context).toEqual({
          configId: "test-123",
          provider: "openai",
        });
      });

      test("extracts context from FileStorageError", () => {
        const error = new FileNotFoundError("/path/to/file", "read");
        const result = serializeError(error);

        expect(result.code).toBe("FILE_NOT_FOUND");
        expect(result.context).toEqual({
          operation: "read",
          filePath: "/path/to/file",
        });
      });

      test("extracts context from SettingsValidationError", () => {
        const fieldErrors = [
          { path: "general.responseDelay", message: "Must be a number" },
        ];
        const error = new SettingsValidationError(
          "/path/to/settings",
          "validate",
          fieldErrors,
        );
        const result = serializeError(error);

        expect(result.code).toBe("VALIDATION_FAILED");
        expect(result.context).toEqual({
          operation: "validate",
          fieldErrors,
        });
      });

      test("filters sensitive data from context", () => {
        const context = {
          configId: "test-123",
          apiKey: "secret-key",
          password: "secret-pass",
          token: "auth-token",
          normalField: "safe-value",
        };
        const error = new LlmConfigError("Test error", "TEST_CODE", context);
        const result = serializeError(error);

        expect(result.context).toEqual({
          configId: "test-123",
          normalField: "safe-value",
        });
        expect(result.context).not.toHaveProperty("apiKey");
        expect(result.context).not.toHaveProperty("password");
        expect(result.context).not.toHaveProperty("token");
      });

      test("sanitizes paths in context strings", () => {
        const context = {
          filePath: "/Users/john/Documents/config.json",
          operation: "read",
        };
        const error = new LlmConfigError("Test error", "TEST_CODE", context);
        const result = serializeError(error);

        expect(result.context?.filePath).toBe(
          "<user-path>/Documents/config.json",
        );
        expect(result.context?.operation).toBe("read");
      });

      test("handles nested context objects", () => {
        const context = {
          config: {
            provider: "openai",
            apiKey: "secret",
            settings: {
              baseUrl: "https://api.openai.com",
              secret: "nested-secret",
              timeout: 30000,
            },
          },
        };
        const error = new LlmConfigError("Test error", "TEST_CODE", context);
        const result = serializeError(error);

        expect(result.context).toEqual({
          config: {
            provider: "openai",
            settings: {
              baseUrl: "https://api.openai.com",
              timeout: 30000,
            },
          },
        });
      });

      test("returns undefined context for errors without context", () => {
        const error = new Error("Simple error");
        const result = serializeError(error);

        expect(result.context).toBeUndefined();
      });
    });

    describe("Generic Error Type Detection", () => {
      test("detects validation errors by message content", () => {
        const error = new Error("Invalid input validation failed");
        const result = serializeError(error);

        expect(result.code).toBe("VALIDATION_ERROR");
      });

      test("detects service errors by message content", () => {
        const error = new Error("Service operation failed");
        const result = serializeError(error);

        expect(result.code).toBe("SERVICE_ERROR");
      });

      test("detects storage errors by message content", () => {
        const error = new Error("Storage connection failed");
        const result = serializeError(error);

        expect(result.code).toBe("STORAGE_ERROR");
      });

      test("falls back to error name for unrecognized messages", () => {
        const error = new Error("Unrecognized error message");
        const result = serializeError(error);

        expect(result.code).toBe("Error");
      });
    });

    describe("LLM Config Error Types", () => {
      test("serializes ConfigNotFoundError", () => {
        const error = new ConfigNotFoundError("config-123");
        const result = serializeError(error);

        expect(result.code).toBe("CONFIG_NOT_FOUND");
        expect(result.message).toContain("config-123");
      });

      test("serializes InvalidConfigError", () => {
        const error = new InvalidConfigError("Invalid configuration data");
        const result = serializeError(error);

        expect(result.code).toBe("INVALID_CONFIG_DATA");
        expect(result.message).toBe("Invalid configuration data");
      });

      test("preserves LlmConfigError code when available", () => {
        const error = new LlmConfigError("Custom error", "CUSTOM_CODE");
        const result = serializeError(error);

        expect(result.code).toBe("CUSTOM_CODE");
        expect(result.message).toBe("Custom error");
      });
    });

    describe("Type Safety", () => {
      test("returns SerializableError type", () => {
        const error = new Error("Test");
        const result = serializeError(error);

        // Type assertions to ensure the return type matches SerializableError
        expect(typeof result.message).toBe("string");
        expect(typeof result.code).toBe("string");
        if (result.stack !== undefined) {
          expect(typeof result.stack).toBe("string");
        }
        if (result.context !== undefined) {
          expect(typeof result.context).toBe("object");
        }
      });
    });
  });

  describe("Response Helper Functions", () => {
    describe("createSuccessResponse", () => {
      test("creates success response with data", () => {
        const data = { id: "123", name: "test" };
        const result = createSuccessResponse(data);

        expect(result).toEqual({
          success: true,
          data: { id: "123", name: "test" },
        });
      });

      test("creates success response with null data", () => {
        const result = createSuccessResponse(null);

        expect(result).toEqual({
          success: true,
          data: null,
        });
      });

      test("creates success response with primitive data", () => {
        const result = createSuccessResponse("simple string");

        expect(result).toEqual({
          success: true,
          data: "simple string",
        });
      });

      test("maintains type safety for generic data", () => {
        interface TestData {
          value: number;
        }
        const data: TestData = { value: 42 };
        const result = createSuccessResponse(data);

        expect(result.success).toBe(true);
        expect(result.data?.value).toBe(42);
      });
    });

    describe("createErrorResponse", () => {
      test("creates error response with serialized error", () => {
        const error = new Error("Test error");
        const result = createErrorResponse(error);

        expect(result.success).toBe(false);
        expect(result.error).toEqual({
          message: "Test error",
          code: "Error",
        });
        expect(result.data).toBeUndefined();
      });

      test("creates error response with context", () => {
        const context = { operation: "test" };
        const error = new LlmConfigError("Config error", "TEST_ERROR", context);
        const result = createErrorResponse(error);

        expect(result.success).toBe(false);
        expect(result.error).toEqual({
          message: "Config error",
          code: "TEST_ERROR",
          context: { operation: "test" },
        });
      });

      test("creates error response from non-Error types", () => {
        const result = createErrorResponse("String error");

        expect(result.success).toBe(false);
        expect(result.error).toEqual({
          message: "String error",
          code: "UNKNOWN_ERROR",
        });
      });

      test("handles sensitive data filtering in error responses", () => {
        const context = {
          operation: "create",
          apiKey: "secret-key",
          config: "safe-data",
        };
        const error = new LlmConfigError(
          "Creation failed",
          "CREATE_ERROR",
          context,
        );
        const result = createErrorResponse(error);

        expect(result.success).toBe(false);
        expect(result.error?.context).toEqual({
          operation: "create",
          config: "safe-data",
        });
        expect(result.error?.context).not.toHaveProperty("apiKey");
      });
    });
  });
});
