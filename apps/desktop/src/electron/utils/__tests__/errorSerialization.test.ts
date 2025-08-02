import { serializeError } from "../errorSerialization";
import {
  FileStorageError,
  FileNotFoundError,
  WritePermissionError,
  InvalidJsonError,
  SettingsValidationError,
  SchemaVersionError,
} from "@fishbowl-ai/shared";

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
      });
    });
  });
});
