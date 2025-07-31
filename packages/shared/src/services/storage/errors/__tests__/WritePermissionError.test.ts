import { WritePermissionError } from "../WritePermissionError";
import { FileStorageError } from "../FileStorageError";

describe("WritePermissionError", () => {
  describe("constructor", () => {
    it("should create error with proper message format", () => {
      const error = new WritePermissionError("/protected/file.json", "write");

      expect(error.message).toBe(
        "Write permission denied: /protected/file.json",
      );
      expect(error.operation).toBe("write");
      expect(error.filePath).toBe("/protected/file.json");
      expect(error.name).toBe("WritePermissionError");
    });

    it("should include cause error when provided", () => {
      const cause = new Error("EACCES: permission denied");
      const error = new WritePermissionError("/readonly.json", "write", cause);

      expect(error.cause).toBe(cause);
      expect(error.message).toBe("Write permission denied: /readonly.json");
    });

    it("should work without cause parameter", () => {
      const error = new WritePermissionError("/file.json", "create");

      expect(error.cause).toBeUndefined();
      expect(error.message).toBe("Write permission denied: /file.json");
    });
  });

  describe("inheritance", () => {
    it("should extend FileStorageError", () => {
      const error = new WritePermissionError("/test.json", "write");

      expect(error).toBeInstanceOf(FileStorageError);
      expect(error).toBeInstanceOf(WritePermissionError);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("toJSON", () => {
    it("should serialize correctly", () => {
      const cause = new Error("EPERM: operation not permitted");
      const error = new WritePermissionError(
        "/system/config.json",
        "write",
        cause,
      );
      const json = error.toJSON();

      expect(json).toEqual({
        name: "WritePermissionError",
        message: "Write permission denied: /system/config.json",
        operation: "write",
        filePath: "/system/config.json",
        cause: "EPERM: operation not permitted",
      });
    });

    it("should serialize without cause", () => {
      const error = new WritePermissionError("/readonly.json", "update");
      const json = error.toJSON();

      expect(json).toEqual({
        name: "WritePermissionError",
        message: "Write permission denied: /readonly.json",
        operation: "update",
        filePath: "/readonly.json",
        cause: undefined,
      });
    });
  });

  describe("different file paths", () => {
    it("should handle various protected file paths", () => {
      const protectedPaths = [
        "/system/config.json",
        "/usr/local/bin/settings.json",
        "C:\\Program Files\\app\\config.json",
        "/readonly/data.json",
        "/tmp/locked-file.json",
      ];

      protectedPaths.forEach((filePath) => {
        const error = new WritePermissionError(filePath, "write");
        expect(error.message).toBe(`Write permission denied: ${filePath}`);
        expect(error.filePath).toBe(filePath);
      });
    });
  });

  describe("different operations", () => {
    it("should handle various write-related operations", () => {
      const operations = [
        "write",
        "create",
        "update",
        "save",
        "append",
        "truncate",
      ];

      operations.forEach((operation) => {
        const error = new WritePermissionError("/protected.json", operation);
        expect(error.operation).toBe(operation);
        expect(error.message).toBe("Write permission denied: /protected.json");
      });
    });
  });

  describe("common permission scenarios", () => {
    it("should handle system file permission errors", () => {
      const systemCause = new Error(
        "EACCES: permission denied, open '/etc/config.json'",
      );
      const error = new WritePermissionError(
        "/etc/config.json",
        "write",
        systemCause,
      );

      expect(error.cause).toBe(systemCause);
      expect(error.filePath).toBe("/etc/config.json");
    });

    it("should handle Windows permission errors", () => {
      const windowsCause = new Error(
        "EPERM: operation not permitted, open 'C:\\Windows\\system32\\config.json'",
      );
      const error = new WritePermissionError(
        "C:\\Windows\\system32\\config.json",
        "create",
        windowsCause,
      );

      expect(error.cause).toBe(windowsCause);
      expect(error.filePath).toBe("C:\\Windows\\system32\\config.json");
    });

    it("should handle readonly file errors", () => {
      const readonlyCause = new Error(
        "EACCES: permission denied, open '/readonly/file.json'",
      );
      const error = new WritePermissionError(
        "/readonly/file.json",
        "update",
        readonlyCause,
      );

      expect(error.cause).toBe(readonlyCause);
      expect(error.operation).toBe("update");
    });
  });
});
