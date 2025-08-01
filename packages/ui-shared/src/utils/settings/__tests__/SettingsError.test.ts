import { SettingsError } from "../SettingsError";
import { SettingsErrorCode } from "../SettingsErrorCode";

describe("SettingsError", () => {
  it("should create error with message and code", () => {
    const error = new SettingsError(
      "Test error",
      SettingsErrorCode.VALIDATION_FAILED,
    );

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(SettingsError);
    expect(error.message).toBe("Test error");
    expect(error.code).toBe(SettingsErrorCode.VALIDATION_FAILED);
    expect(error.name).toBe("SettingsError");
    expect(error.details).toBeUndefined();
  });

  it("should include optional details", () => {
    const details = { field: "theme", operation: "save" };
    const error = new SettingsError(
      "Save failed",
      SettingsErrorCode.PERSISTENCE_FAILED,
      details,
    );

    expect(error.details).toEqual(details);
  });

  it("should maintain proper stack trace", () => {
    const error = new SettingsError(
      "Stack trace test",
      SettingsErrorCode.UNKNOWN_ERROR,
    );

    expect(error.stack).toBeDefined();
    expect(typeof error.stack).toBe("string");
    expect(error.stack).toContain("SettingsError");
  });

  it("should be serializable", () => {
    const details = { operation: "load", file: "settings.json" };
    const error = new SettingsError(
      "Serialization test",
      SettingsErrorCode.PERSISTENCE_FAILED,
      details,
    );

    const serialized = JSON.stringify({
      message: error.message,
      code: error.code,
      details: error.details,
      name: error.name,
    });

    const parsed = JSON.parse(serialized);
    expect(parsed.message).toBe(error.message);
    expect(parsed.code).toBe(error.code);
    expect(parsed.details).toEqual(error.details);
    expect(parsed.name).toBe(error.name);
  });

  it("should handle undefined details", () => {
    const errorWithUndefined = new SettingsError(
      "Undefined details",
      SettingsErrorCode.MAPPING_FAILED,
      undefined,
    );
    expect(errorWithUndefined.details).toBeUndefined();
  });
});
