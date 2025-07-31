import { SchemaVersionError } from "../SchemaVersionError";
import { FileStorageError } from "../FileStorageError";

describe("SchemaVersionError", () => {
  describe("constructor", () => {
    it("should create error with proper message format", () => {
      const error = new SchemaVersionError(
        "/config/settings.json",
        "read",
        "1.0.0",
        "2.0.0",
      );

      expect(error.message).toBe(
        "Schema version mismatch: expected 2.0.0, got 1.0.0",
      );
      expect(error.operation).toBe("read");
      expect(error.filePath).toBe("/config/settings.json");
      expect(error.currentVersion).toBe("1.0.0");
      expect(error.expectedVersion).toBe("2.0.0");
      expect(error.name).toBe("SchemaVersionError");
    });

    it("should include cause error when provided", () => {
      const cause = new Error("Version check failed");
      const error = new SchemaVersionError(
        "/settings.json",
        "migrate",
        "0.9.0",
        "1.0.0",
        cause,
      );

      expect(error.cause).toBe(cause);
      expect(error.currentVersion).toBe("0.9.0");
      expect(error.expectedVersion).toBe("1.0.0");
    });

    it("should work without cause parameter", () => {
      const error = new SchemaVersionError(
        "/file.json",
        "validate",
        "1.0",
        "2.0",
      );

      expect(error.cause).toBeUndefined();
      expect(error.currentVersion).toBe("1.0");
      expect(error.expectedVersion).toBe("2.0");
    });
  });

  describe("inheritance", () => {
    it("should extend FileStorageError", () => {
      const error = new SchemaVersionError("/test.json", "read", "1.0", "2.0");

      expect(error).toBeInstanceOf(FileStorageError);
      expect(error).toBeInstanceOf(SchemaVersionError);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("toJSON", () => {
    it("should include version information in serialization", () => {
      const cause = new Error("Schema error");
      const error = new SchemaVersionError(
        "/config.json",
        "migrate",
        "1.2.3",
        "2.0.0",
        cause,
      );
      const json = error.toJSON();

      expect(json).toEqual({
        name: "SchemaVersionError",
        message: "Schema version mismatch: expected 2.0.0, got 1.2.3",
        operation: "migrate",
        filePath: "/config.json",
        cause: "Schema error",
        currentVersion: "1.2.3",
        expectedVersion: "2.0.0",
      });
    });

    it("should serialize without cause", () => {
      const error = new SchemaVersionError(
        "/test.json",
        "validate",
        "0.1.0",
        "1.0.0",
      );
      const json = error.toJSON();

      expect(json).toEqual({
        name: "SchemaVersionError",
        message: "Schema version mismatch: expected 1.0.0, got 0.1.0",
        operation: "validate",
        filePath: "/test.json",
        cause: undefined,
        currentVersion: "0.1.0",
        expectedVersion: "1.0.0",
      });
    });
  });

  describe("version properties", () => {
    it("should handle various version formats", () => {
      const versionPairs = [
        { current: "1.0.0", expected: "2.0.0" },
        { current: "v1.2.3", expected: "v2.0.0" },
        { current: "1", expected: "2" },
        { current: "2023.1", expected: "2024.1" },
      ];

      versionPairs.forEach(({ current, expected }) => {
        const error = new SchemaVersionError(
          "/config.json",
          "check",
          current,
          expected,
        );
        expect(error.currentVersion).toBe(current);
        expect(error.expectedVersion).toBe(expected);
        expect(error.message).toContain(current);
        expect(error.message).toContain(expected);
      });
    });

    it("should have readonly version properties", () => {
      const error = new SchemaVersionError(
        "/test.json",
        "read",
        "1.0.0",
        "2.0.0",
      );

      expect(error.currentVersion).toBe("1.0.0");
      expect(error.expectedVersion).toBe("2.0.0");
    });
  });

  describe("various operations", () => {
    it("should handle different operations", () => {
      const operations = ["read", "validate", "migrate", "upgrade"];

      operations.forEach((operation) => {
        const error = new SchemaVersionError(
          "/test.json",
          operation,
          "1.0",
          "2.0",
        );
        expect(error.operation).toBe(operation);
      });
    });
  });
});
