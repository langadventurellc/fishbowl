import { FileStorageError } from "../FileStorageError";

class TestFileStorageError extends FileStorageError {
  constructor(
    message: string,
    operation: string,
    filePath: string,
    cause?: Error,
  ) {
    super(message, operation, filePath, cause);
  }
}

describe("FileStorageError", () => {
  describe("constructor", () => {
    it("should set all properties correctly", () => {
      const cause = new Error("Original error");
      const error = new TestFileStorageError(
        "Test message",
        "read",
        "/test/path",
        cause,
      );

      expect(error.message).toBe("Test message");
      expect(error.operation).toBe("read");
      expect(error.filePath).toBe("/test/path");
      expect(error.cause).toBe(cause);
      expect(error.name).toBe("TestFileStorageError");
    });

    it("should work without cause parameter", () => {
      const error = new TestFileStorageError("Test message", "write", "/path");

      expect(error.message).toBe("Test message");
      expect(error.operation).toBe("write");
      expect(error.filePath).toBe("/path");
      expect(error.cause).toBeUndefined();
      expect(error.name).toBe("TestFileStorageError");
    });

    it("should be instance of Error", () => {
      const error = new TestFileStorageError("Test", "read", "/path");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(FileStorageError);
    });

    it("should have proper stack trace", () => {
      const error = new TestFileStorageError("Test", "read", "/path");

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe("string");
    });
  });

  describe("toJSON", () => {
    it("should serialize error with all properties", () => {
      const cause = new Error("Original error");
      const error = new TestFileStorageError(
        "Test message",
        "read",
        "/test/path",
        cause,
      );
      const json = error.toJSON();

      expect(json).toEqual({
        name: "TestFileStorageError",
        message: "Test message",
        operation: "read",
        filePath: "/test/path",
        cause: "Original error",
      });
    });

    it("should serialize error without cause", () => {
      const error = new TestFileStorageError("Test", "write", "/path");
      const json = error.toJSON();

      expect(json).toEqual({
        name: "TestFileStorageError",
        message: "Test",
        operation: "write",
        filePath: "/path",
        cause: undefined,
      });
    });

    it("should not include stack trace in JSON", () => {
      const error = new TestFileStorageError("Test", "read", "/path");
      const json = error.toJSON();

      expect(json).not.toHaveProperty("stack");
    });

    it("should be properly serializable", () => {
      const error = new TestFileStorageError("Test", "read", "/path");
      const json = error.toJSON();

      expect(() => JSON.stringify(json)).not.toThrow();
      const serialized = JSON.stringify(json);
      expect(() => JSON.parse(serialized)).not.toThrow();
    });
  });

  describe("error properties immutability", () => {
    it("should have readonly operation property", () => {
      const error = new TestFileStorageError("Test", "read", "/path");

      expect(error.operation).toBe("read");
    });

    it("should have readonly filePath property", () => {
      const error = new TestFileStorageError("Test", "read", "/test/path");

      expect(error.filePath).toBe("/test/path");
    });

    it("should have readonly cause property", () => {
      const cause = new Error("Original");
      const error = new TestFileStorageError("Test", "read", "/path", cause);

      expect(error.cause).toBe(cause);
    });
  });
});
