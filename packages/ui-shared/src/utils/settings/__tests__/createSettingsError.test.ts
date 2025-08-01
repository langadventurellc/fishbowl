import { createSettingsError } from "../createSettingsError";
import { SettingsError } from "../SettingsError";
import { SettingsErrorCode } from "../SettingsErrorCode";

describe("createSettingsError", () => {
  it("should create a SettingsError with message and code", () => {
    const error = createSettingsError(
      "Test error",
      SettingsErrorCode.VALIDATION_FAILED,
    );

    expect(error).toBeInstanceOf(SettingsError);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("Test error");
    expect(error.code).toBe(SettingsErrorCode.VALIDATION_FAILED);
    expect(error.name).toBe("SettingsError");
    expect(error.details).toBeUndefined();
  });

  it("should include optional details", () => {
    const details = { field: "theme", value: "invalid" };
    const error = createSettingsError(
      "Invalid theme",
      SettingsErrorCode.VALIDATION_FAILED,
      details,
    );

    expect(error.details).toEqual(details);
  });

  it("should maintain stack trace", () => {
    const error = createSettingsError(
      "Stack test",
      SettingsErrorCode.UNKNOWN_ERROR,
    );

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain("createSettingsError");
  });

  it("should work with all error codes", () => {
    const codes = [
      SettingsErrorCode.VALIDATION_FAILED,
      SettingsErrorCode.PERSISTENCE_FAILED,
      SettingsErrorCode.MAPPING_FAILED,
      SettingsErrorCode.UNKNOWN_ERROR,
    ];

    codes.forEach((code) => {
      const error = createSettingsError("Test message", code);
      expect(error.code).toBe(code);
      expect(error).toBeInstanceOf(SettingsError);
    });
  });

  it("should handle empty details object", () => {
    const error = createSettingsError(
      "Test error",
      SettingsErrorCode.PERSISTENCE_FAILED,
      {},
    );

    expect(error.details).toEqual({});
  });

  it("should handle complex details object", () => {
    const details = {
      operation: "save",
      category: "appearance",
      fieldErrors: ["theme", "fontSize"],
      timestamp: new Date().toISOString(),
      nested: {
        level: 1,
        value: null,
      },
    };

    const error = createSettingsError(
      "Complex error",
      SettingsErrorCode.MAPPING_FAILED,
      details,
    );

    expect(error.details).toEqual(details);
  });
});
