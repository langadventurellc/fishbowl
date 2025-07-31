import { InvalidJsonError } from "../InvalidJsonError";
import { FileStorageError } from "../FileStorageError";

describe("InvalidJsonError", () => {
  describe("constructor", () => {
    it("should create error with proper message format", () => {
      const error = new InvalidJsonError(
        "/test/file.json",
        "read",
        "Unexpected token } in JSON",
      );

      expect(error.message).toBe(
        "Invalid JSON in file: /test/file.json - Unexpected token } in JSON",
      );
      expect(error.operation).toBe("read");
      expect(error.filePath).toBe("/test/file.json");
      expect(error.parseError).toBe("Unexpected token } in JSON");
      expect(error.name).toBe("InvalidJsonError");
    });

    it("should include cause error when provided", () => {
      const cause = new SyntaxError("Unexpected end of JSON input");
      const error = new InvalidJsonError(
        "/config.json",
        "read",
        "JSON parse failed",
        cause,
      );

      expect(error.cause).toBe(cause);
      expect(error.parseError).toBe("JSON parse failed");
    });

    it("should work without cause parameter", () => {
      const error = new InvalidJsonError(
        "/file.json",
        "read",
        "Invalid JSON syntax",
      );

      expect(error.cause).toBeUndefined();
      expect(error.parseError).toBe("Invalid JSON syntax");
    });
  });

  describe("inheritance", () => {
    it("should extend FileStorageError", () => {
      const error = new InvalidJsonError("/test.json", "read", "Parse error");

      expect(error).toBeInstanceOf(FileStorageError);
      expect(error).toBeInstanceOf(InvalidJsonError);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("toJSON", () => {
    it("should include parseError in serialization", () => {
      const cause = new SyntaxError("JSON error");
      const error = new InvalidJsonError(
        "/test.json",
        "read",
        "Parse failed",
        cause,
      );
      const json = error.toJSON();

      expect(json).toEqual({
        name: "InvalidJsonError",
        message: "Invalid JSON in file: /test.json - Parse failed",
        operation: "read",
        filePath: "/test.json",
        cause: "JSON error",
        parseError: "Parse failed",
      });
    });

    it("should serialize without cause", () => {
      const error = new InvalidJsonError("/test.json", "read", "Syntax error");
      const json = error.toJSON();

      expect(json).toEqual({
        name: "InvalidJsonError",
        message: "Invalid JSON in file: /test.json - Syntax error",
        operation: "read",
        filePath: "/test.json",
        cause: undefined,
        parseError: "Syntax error",
      });
    });
  });

  describe("parseError property", () => {
    it("should store various JSON parse error messages", () => {
      const parseErrors = [
        "Unexpected token } in JSON at position 45",
        "Unexpected end of JSON input",
        "Expected property name or '}' in JSON at position 12",
        "Unexpected token , in JSON at position 23",
        "Invalid character in string escape sequence",
      ];

      parseErrors.forEach((parseError) => {
        const error = new InvalidJsonError("/config.json", "read", parseError);
        expect(error.parseError).toBe(parseError);
        expect(error.message).toContain(parseError);
      });
    });

    it("should be readonly", () => {
      const error = new InvalidJsonError(
        "/test.json",
        "read",
        "Original error",
      );

      expect(error.parseError).toBe("Original error");
    });
  });

  describe("various file and error scenarios", () => {
    it("should handle different file types", () => {
      const files = [
        "/config.json",
        "/settings.json",
        "/data/preferences.json",
      ];

      files.forEach((file) => {
        const error = new InvalidJsonError(file, "parse", "Invalid JSON");
        expect(error.filePath).toBe(file);
        expect(error.message).toContain(file);
      });
    });

    it("should handle different operations", () => {
      const operations = ["read", "parse", "validate", "decode"];

      operations.forEach((operation) => {
        const error = new InvalidJsonError(
          "/test.json",
          operation,
          "JSON error",
        );
        expect(error.operation).toBe(operation);
      });
    });

    it("should handle empty parse error message", () => {
      const error = new InvalidJsonError("/test.json", "read", "");

      expect(error.parseError).toBe("");
      expect(error.message).toBe("Invalid JSON in file: /test.json - ");
    });
  });
});
