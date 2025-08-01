import { MappingError } from "../MappingError";

describe("MappingError", () => {
  it("should create error with message only", () => {
    const error = new MappingError("Test error");

    expect(error.message).toBe("Test error");
    expect(error.name).toBe("MappingError");
    expect(error.field).toBeUndefined();
    expect(error.value).toBeUndefined();
    expect(error.cause).toBeUndefined();
  });

  it("should create error with field", () => {
    const error = new MappingError("Test error", "email");

    expect(error.message).toBe("Test error");
    expect(error.field).toBe("email");
    expect(error.value).toBeUndefined();
    expect(error.cause).toBeUndefined();
  });

  it("should create error with field and value", () => {
    const error = new MappingError("Test error", "age", 25);

    expect(error.message).toBe("Test error");
    expect(error.field).toBe("age");
    expect(error.value).toBe(25);
    expect(error.cause).toBeUndefined();
  });

  it("should create error with all parameters", () => {
    const originalError = new Error("Original error");
    const error = new MappingError(
      "Test error",
      "username",
      "john_doe",
      originalError,
    );

    expect(error.message).toBe("Test error");
    expect(error.field).toBe("username");
    expect(error.value).toBe("john_doe");
    expect(error.cause).toBe(originalError);
  });

  it("should be instance of Error", () => {
    const error = new MappingError("Test error");

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(MappingError);
  });
});
