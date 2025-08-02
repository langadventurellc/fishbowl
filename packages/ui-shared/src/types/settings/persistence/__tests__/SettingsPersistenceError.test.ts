import { SettingsPersistenceError } from "../SettingsPersistenceError";

describe("SettingsPersistenceError", () => {
  it("should create error with correct properties", () => {
    const cause = new Error("Original error");
    const error = new SettingsPersistenceError(
      "Test error message",
      "save",
      cause,
    );

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(SettingsPersistenceError);
    expect(error.name).toBe("SettingsPersistenceError");
    expect(error.message).toBe("Test error message");
    expect(error.operation).toBe("save");
    expect(error.cause).toBe(cause);
  });

  it("should support all operation types", () => {
    const saveError = new SettingsPersistenceError("Save failed", "save");
    const loadError = new SettingsPersistenceError("Load failed", "load");
    const resetError = new SettingsPersistenceError("Reset failed", "reset");

    expect(saveError.operation).toBe("save");
    expect(loadError.operation).toBe("load");
    expect(resetError.operation).toBe("reset");
  });

  it("should work without cause", () => {
    const error = new SettingsPersistenceError("Test error", "load");

    expect(error.cause).toBeUndefined();
    expect(error.message).toBe("Test error");
    expect(error.operation).toBe("load");
  });

  it("should maintain stack trace", () => {
    const error = new SettingsPersistenceError("Test error", "save");

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain("SettingsPersistenceError");
  });

  it("should properly extend Error class", () => {
    const error = new SettingsPersistenceError("Test error", "reset");

    // Test that it behaves like a proper Error
    expect(error.toString()).toContain("SettingsPersistenceError");
    expect(error.toString()).toContain("Test error");
  });

  it("should handle different cause types", () => {
    const stringCause = "String error";
    const objectCause = { message: "Object error", code: 500 };
    const nullCause = null;

    const errorWithString = new SettingsPersistenceError(
      "Test",
      "save",
      stringCause,
    );
    const errorWithObject = new SettingsPersistenceError(
      "Test",
      "load",
      objectCause,
    );
    const errorWithNull = new SettingsPersistenceError(
      "Test",
      "reset",
      nullCause,
    );

    expect(errorWithString.cause).toBe(stringCause);
    expect(errorWithObject.cause).toBe(objectCause);
    expect(errorWithNull.cause).toBe(nullCause);
  });
});
