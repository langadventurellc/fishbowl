import { FileNotFoundError } from "../FileNotFoundError";
import { FileStorageError } from "../FileStorageError";

describe("FileNotFoundError", () => {
  describe("constructor", () => {
    it("should create error with proper message format", () => {
      const error = new FileNotFoundError("/test/file.json", "read");

      expect(error.message).toBe("File not found: /test/file.json");
      expect(error.operation).toBe("read");
      expect(error.filePath).toBe("/test/file.json");
      expect(error.name).toBe("FileNotFoundError");
    });

    it("should include cause error when provided", () => {
      const cause = new Error("ENOENT: no such file or directory");
      const error = new FileNotFoundError("/missing.json", "read", cause);

      expect(error.cause).toBe(cause);
      expect(error.message).toBe("File not found: /missing.json");
    });

    it("should work without cause parameter", () => {
      const error = new FileNotFoundError("/file.json", "write");

      expect(error.cause).toBeUndefined();
      expect(error.message).toBe("File not found: /file.json");
    });
  });

  describe("inheritance", () => {
    it("should extend FileStorageError", () => {
      const error = new FileNotFoundError("/test.json", "read");

      expect(error).toBeInstanceOf(FileStorageError);
      expect(error).toBeInstanceOf(FileNotFoundError);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("toJSON", () => {
    it("should serialize correctly", () => {
      const cause = new Error("System error");
      const error = new FileNotFoundError("/test.json", "read", cause);
      const json = error.toJSON();

      expect(json).toEqual({
        name: "FileNotFoundError",
        message: "File not found: /test.json",
        operation: "read",
        filePath: "/test.json",
        cause: "System error",
      });
    });
  });

  describe("different file paths", () => {
    it("should handle various file path formats", () => {
      const testCases = [
        "/absolute/path/file.json",
        "relative/path/file.json",
        "./current/dir/file.json",
        "../parent/dir/file.json",
        "C:\\Windows\\file.json",
        "/usr/local/bin/config.json",
      ];

      testCases.forEach((filePath) => {
        const error = new FileNotFoundError(filePath, "read");
        expect(error.message).toBe(`File not found: ${filePath}`);
        expect(error.filePath).toBe(filePath);
      });
    });
  });

  describe("different operations", () => {
    it("should handle various operation types", () => {
      const operations = ["read", "write", "delete", "stat", "access"];

      operations.forEach((operation) => {
        const error = new FileNotFoundError("/test.json", operation);
        expect(error.operation).toBe(operation);
        expect(error.message).toBe("File not found: /test.json");
      });
    });
  });
});
