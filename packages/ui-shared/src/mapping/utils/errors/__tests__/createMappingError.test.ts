import { createMappingError } from "../createMappingError";
import { MappingError } from "../MappingError";

describe("createMappingError", () => {
  it("should create error with message only", () => {
    const error = createMappingError("Validation failed");

    expect(error).toBeInstanceOf(MappingError);
    expect(error.message).toBe("Validation failed");
    expect(error.field).toBeUndefined();
    expect(error.value).toBeUndefined();
    expect(error.cause).toBeUndefined();
  });

  it("should create error with field", () => {
    const error = createMappingError("Invalid format", "email");

    expect(error.message).toBe("Invalid format");
    expect(error.field).toBe("email");
    expect(error.value).toBeUndefined();
    expect(error.cause).toBeUndefined();
  });

  it("should create error with field and value", () => {
    const error = createMappingError("Value too large", "count", 1000);

    expect(error.message).toBe("Value too large");
    expect(error.field).toBe("count");
    expect(error.value).toBe(1000);
    expect(error.cause).toBeUndefined();
  });

  it("should create error with all parameters", () => {
    const originalError = new Error("Database error");
    const error = createMappingError(
      "Lookup failed",
      "userId",
      123,
      originalError,
    );

    expect(error.message).toBe("Lookup failed");
    expect(error.field).toBe("userId");
    expect(error.value).toBe(123);
    expect(error.cause).toBe(originalError);
  });

  it("should handle complex values", () => {
    const complexValue = { nested: { data: [1, 2, 3] } };
    const error = createMappingError(
      "Complex validation failed",
      "settings",
      complexValue,
    );

    expect(error.value).toBe(complexValue);
    expect(error.value).toEqual({ nested: { data: [1, 2, 3] } });
  });
});
