import { ErrorFactory } from "../ErrorFactory";
import { FileNotFoundError } from "../FileNotFoundError";
import { WritePermissionError } from "../WritePermissionError";
import { InvalidJsonError } from "../InvalidJsonError";
import { FileStorageError } from "../FileStorageError";

describe("ErrorFactory", () => {
  describe("fromNodeError", () => {
    it("should create FileNotFoundError for ENOENT", () => {
      const nodeError = {
        name: "Error",
        message: "ENOENT: no such file or directory, open '/missing.json'",
        code: "ENOENT",
        errno: -2,
        path: "/missing.json",
        syscall: "open",
      };

      const error = ErrorFactory.fromNodeError(
        nodeError,
        "read",
        "/missing.json",
      );

      expect(error).toBeInstanceOf(FileNotFoundError);
      expect(error.filePath).toBe("/missing.json");
      expect(error.operation).toBe("read");
      expect(error.cause).toBe(nodeError);
    });

    it("should create WritePermissionError for EACCES", () => {
      const nodeError = {
        name: "Error",
        message: "EACCES: permission denied, open '/protected.json'",
        code: "EACCES",
        errno: -13,
        path: "/protected.json",
        syscall: "open",
      };

      const error = ErrorFactory.fromNodeError(
        nodeError,
        "write",
        "/protected.json",
      );

      expect(error).toBeInstanceOf(WritePermissionError);
      expect(error.filePath).toBe("/protected.json");
      expect(error.operation).toBe("write");
      expect(error.cause).toBe(nodeError);
    });

    it("should create WritePermissionError for EPERM", () => {
      const nodeError = {
        name: "Error",
        message: "EPERM: operation not permitted, mkdir '/system'",
        code: "EPERM",
        errno: -1,
        path: "/system",
        syscall: "mkdir",
      };

      const error = ErrorFactory.fromNodeError(nodeError, "mkdir", "/system");

      expect(error).toBeInstanceOf(WritePermissionError);
      expect(error.filePath).toBe("/system");
      expect(error.operation).toBe("mkdir");
      expect(error.cause).toBe(nodeError);
    });

    it("should create generic FileStorageError for unknown error codes", () => {
      const nodeError = {
        name: "Error",
        message: "EMFILE: too many open files, open '/file.json'",
        code: "EMFILE",
        errno: -24,
        path: "/file.json",
        syscall: "open",
      };

      const error = ErrorFactory.fromNodeError(nodeError, "read", "/file.json");

      expect(error).toBeInstanceOf(FileStorageError);
      expect(error).not.toBeInstanceOf(FileNotFoundError);
      expect(error).not.toBeInstanceOf(WritePermissionError);
      expect(error.message).toBe(
        "File system operation failed: EMFILE: too many open files, open '/file.json'",
      );
      expect(error.filePath).toBe("/file.json");
      expect(error.operation).toBe("read");
      expect(error.cause).toBe(nodeError);
    });

    it("should handle error without code property", () => {
      const nodeError = {
        name: "Error",
        message: "Unknown file system error",
        errno: -999,
      };

      const error = ErrorFactory.fromNodeError(nodeError, "read", "/test.json");

      expect(error).toBeInstanceOf(FileStorageError);
      expect(error.message).toBe(
        "File system operation failed: Unknown file system error",
      );
      expect(error.filePath).toBe("/test.json");
      expect(error.operation).toBe("read");
      expect(error.cause).toBe(nodeError);
    });

    it("should handle different operations correctly", () => {
      const nodeError = {
        name: "Error",
        message: "ENOENT: no such file or directory",
        code: "ENOENT",
      };

      const operations = ["read", "write", "stat", "unlink", "mkdir"];

      operations.forEach((operation) => {
        const error = ErrorFactory.fromNodeError(
          nodeError,
          operation,
          "/test.json",
        );
        expect(error.operation).toBe(operation);
        expect(error).toBeInstanceOf(FileNotFoundError);
      });
    });
  });

  describe("fromJsonError", () => {
    it("should create InvalidJsonError from SyntaxError", () => {
      const parseError = new SyntaxError(
        "Unexpected token } in JSON at position 45",
      );

      const error = ErrorFactory.fromJsonError(
        parseError,
        "parse",
        "/config.json",
      );

      expect(error).toBeInstanceOf(InvalidJsonError);
      expect(error.filePath).toBe("/config.json");
      expect(error.operation).toBe("parse");
      expect(error.cause).toBe(parseError);
      expect(error.parseError).toBe(
        "Unexpected token } in JSON at position 45",
      );
    });

    it("should create InvalidJsonError from generic Error", () => {
      const parseError = new Error("JSON parsing failed");

      const error = ErrorFactory.fromJsonError(
        parseError,
        "read",
        "/data.json",
      );

      expect(error).toBeInstanceOf(InvalidJsonError);
      expect(error.filePath).toBe("/data.json");
      expect(error.operation).toBe("read");
      expect(error.cause).toBe(parseError);
      expect(error.parseError).toBe("JSON parsing failed");
    });

    it("should handle various JSON parse error messages", () => {
      const errorMessages = [
        "Unexpected end of JSON input",
        "Expected property name or '}' in JSON at position 12",
        "Unexpected token , in JSON at position 23",
        "Invalid character in string escape sequence",
      ];

      errorMessages.forEach((message) => {
        const parseError = new SyntaxError(message);
        const error = ErrorFactory.fromJsonError(
          parseError,
          "parse",
          "/test.json",
        );

        expect(error.parseError).toBe(message);
        expect(error.message).toContain(message);
      });
    });

    it("should handle different operations", () => {
      const parseError = new SyntaxError("Invalid JSON");
      const operations = ["parse", "read", "validate", "decode"];

      operations.forEach((operation) => {
        const error = ErrorFactory.fromJsonError(
          parseError,
          operation,
          "/test.json",
        );
        expect(error.operation).toBe(operation);
      });
    });
  });

  describe("error context preservation", () => {
    it("should preserve all context in fromNodeError", () => {
      const nodeError = {
        name: "SystemError",
        message: "ENOENT: no such file or directory, stat '/path/to/file.json'",
        code: "ENOENT",
        errno: -2,
        path: "/path/to/file.json",
        syscall: "stat",
      };

      const error = ErrorFactory.fromNodeError(
        nodeError,
        "stat",
        "/path/to/file.json",
      );

      expect(error.cause).toBe(nodeError);
      expect(error.filePath).toBe("/path/to/file.json");
      expect(error.operation).toBe("stat");
    });

    it("should preserve all context in fromJsonError", () => {
      const parseError = new SyntaxError("Unexpected token");
      parseError.stack = "SyntaxError: Unexpected token\n    at JSON.parse";

      const error = ErrorFactory.fromJsonError(
        parseError,
        "parse",
        "/config.json",
      );

      expect(error.cause).toBe(parseError);
      expect(error.filePath).toBe("/config.json");
      expect(error.operation).toBe("parse");
      expect(error.parseError).toBe("Unexpected token");
    });
  });
});
