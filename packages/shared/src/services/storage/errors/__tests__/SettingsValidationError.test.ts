import { FileStorageError } from "../FileStorageError";
import { SettingsValidationError } from "../SettingsValidationError";

describe("SettingsValidationError", () => {
  describe("constructor", () => {
    it("should create error with proper message format", () => {
      const fieldErrors = [
        { path: "theme", message: "Invalid theme value" },
        { path: "fontSize", message: "Font size must be a number" },
      ];
      const error = new SettingsValidationError(
        "/config/settings.json",
        "validate",
        fieldErrors,
      );

      expect(error.message).toBe("Settings validation failed: 2 field errors");
      expect(error.operation).toBe("validate");
      expect(error.filePath).toBe("/config/settings.json");
      expect(error.fieldErrors).toBe(fieldErrors);
      expect(error.name).toBe("SettingsValidationError");
    });

    it("should include cause error when provided", () => {
      const cause = new Error("Validation library error");
      const fieldErrors = [{ path: "test", message: "Test error" }];
      const error = new SettingsValidationError(
        "/settings.json",
        "validate",
        fieldErrors,
        cause,
      );

      expect(error.cause).toBe(cause);
      expect(error.fieldErrors).toBe(fieldErrors);
    });

    it("should work with empty field errors array", () => {
      const error = new SettingsValidationError(
        "/settings.json",
        "validate",
        [],
      );

      expect(error.message).toBe("Settings validation failed: 0 field errors");
      expect(error.fieldErrors).toEqual([]);
    });
  });

  describe("inheritance", () => {
    it("should extend FileStorageError", () => {
      const error = new SettingsValidationError("/test.json", "validate", []);

      expect(error).toBeInstanceOf(FileStorageError);
      expect(error).toBeInstanceOf(SettingsValidationError);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("toJSON", () => {
    it("should include fieldErrors in serialization", () => {
      const fieldErrors = [
        { path: "theme", message: "Invalid value" },
        { path: "language", message: "Unsupported language" },
      ];
      const cause = new Error("Schema validation failed");
      const error = new SettingsValidationError(
        "/config.json",
        "validate",
        fieldErrors,
        cause,
      );
      const json = error.toJSON();

      expect(json).toEqual({
        name: "SettingsValidationError",
        message: "Settings validation failed: 2 field errors",
        operation: "validate",
        filePath: "/config.json",
        cause: "Schema validation failed",
        fieldErrors: fieldErrors,
      });
    });

    it("should serialize without cause", () => {
      const fieldErrors = [{ path: "test", message: "Test error" }];
      const error = new SettingsValidationError(
        "/test.json",
        "validate",
        fieldErrors,
      );
      const json = error.toJSON();

      expect(json).toEqual({
        name: "SettingsValidationError",
        message: "Settings validation failed: 1 field errors",
        operation: "validate",
        filePath: "/test.json",
        cause: undefined,
        fieldErrors: fieldErrors,
      });
    });
  });

  describe("fieldErrors property", () => {
    it("should handle various field error structures", () => {
      const fieldErrors = [
        { path: "appearance.theme", message: "Must be 'light' or 'dark'" },
        { path: "general.language", message: "Invalid language code" },
        { path: "advanced.debugLogging", message: "Must be boolean" },
      ];

      const error = new SettingsValidationError(
        "/settings.json",
        "validate",
        fieldErrors,
      );
      expect(error.fieldErrors).toBe(fieldErrors);
      expect(error.fieldErrors).toHaveLength(3);
    });

    it("should be readonly", () => {
      const fieldErrors = [{ path: "test", message: "error" }];
      const error = new SettingsValidationError(
        "/test.json",
        "validate",
        fieldErrors,
      );

      expect(error.fieldErrors).toBe(fieldErrors);
    });
  });
});
