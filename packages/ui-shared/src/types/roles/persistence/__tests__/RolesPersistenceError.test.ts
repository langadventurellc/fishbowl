import { RolesPersistenceError } from "../RolesPersistenceError";

describe("RolesPersistenceError", () => {
  it("should create error with correct properties", () => {
    const cause = new Error("Original error");
    const error = new RolesPersistenceError(
      "Test error message",
      "save",
      cause,
    );

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(RolesPersistenceError);
    expect(error.name).toBe("RolesPersistenceError");
    expect(error.message).toBe("Test error message");
    expect(error.operation).toBe("save");
    expect(error.cause).toBe(cause);
  });

  it("should support all operation types", () => {
    const saveError = new RolesPersistenceError("Save failed", "save");
    const loadError = new RolesPersistenceError("Load failed", "load");
    const resetError = new RolesPersistenceError("Reset failed", "reset");

    expect(saveError.operation).toBe("save");
    expect(loadError.operation).toBe("load");
    expect(resetError.operation).toBe("reset");
  });

  it("should work without cause", () => {
    const error = new RolesPersistenceError("Test error", "load");

    expect(error.cause).toBeUndefined();
    expect(error.message).toBe("Test error");
    expect(error.operation).toBe("load");
  });

  it("should maintain stack trace", () => {
    const error = new RolesPersistenceError("Test error", "save");

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain("RolesPersistenceError");
  });

  it("should properly extend Error class", () => {
    const error = new RolesPersistenceError("Test error", "reset");

    // Test that it behaves like a proper Error
    expect(error.toString()).toContain("RolesPersistenceError");
    expect(error.toString()).toContain("Test error");
  });

  it("should handle different cause types", () => {
    const stringCause = "String error";
    const objectCause = { message: "Object error", code: 500 };
    const nullCause = null;

    const errorWithString = new RolesPersistenceError(
      "Test",
      "save",
      stringCause,
    );
    const errorWithObject = new RolesPersistenceError(
      "Test",
      "load",
      objectCause,
    );
    const errorWithNull = new RolesPersistenceError("Test", "reset", nullCause);

    expect(errorWithString.cause).toBe(stringCause);
    expect(errorWithObject.cause).toBe(objectCause);
    expect(errorWithNull.cause).toBe(nullCause);
  });
});
