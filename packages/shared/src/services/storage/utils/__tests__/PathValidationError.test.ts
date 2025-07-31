import { PathValidationError } from "../PathValidationError";

describe("PathValidationError", () => {
  it("should create error with correct properties", () => {
    const error = new PathValidationError(
      "/test/path",
      "validate",
      "Test reason",
      new Error("Original error"),
    );

    expect(error.name).toBe("PathValidationError");
    expect(error.message).toBe("Path validation failed: Test reason");
    expect(error.operation).toBe("validate");
    expect(error.filePath).toBe("/test/path");
    expect(error.cause).toBeInstanceOf(Error);
  });

  it("should work without cause parameter", () => {
    const error = new PathValidationError(
      "/test/path",
      "sanitize",
      "Another reason",
    );

    expect(error.name).toBe("PathValidationError");
    expect(error.message).toBe("Path validation failed: Another reason");
    expect(error.operation).toBe("sanitize");
    expect(error.filePath).toBe("/test/path");
    expect(error.cause).toBeUndefined();
  });
});
