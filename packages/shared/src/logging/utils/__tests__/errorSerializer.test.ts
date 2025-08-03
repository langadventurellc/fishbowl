import { serializeError } from "../errorSerializer";

describe("serializeError", () => {
  it("should serialize a standard Error", () => {
    const error = new Error("Test error message");
    const result = serializeError(error);

    expect(result.message).toBe("Test error message");
    expect(result.name).toBe("Error");
    expect(result.stack).toBeDefined();
    expect(result.stack).toContain("Test error message");
  });

  it("should handle custom error properties", () => {
    const error = new Error("Custom error") as Error & {
      code: string;
      statusCode: number;
      customField: string;
    };
    error.code = "ERR_001";
    error.statusCode = 404;
    error.customField = "custom value";

    const result = serializeError(error);

    expect(result.message).toBe("Custom error");
    expect(result.name).toBe("Error");
    expect(result.metadata).toEqual({
      statusCode: 404,
      customField: "custom value",
    });
  });

  it("should handle error code in main properties", () => {
    const error = new Error("Error with code") as Error & { code: string };
    error.code = "ENOENT";

    const result = serializeError(error);

    expect(result.message).toBe("Error with code");
    expect(result.code).toBe("ENOENT");
  });

  it("should handle numeric error code", () => {
    const error = new Error("Error with numeric code") as Error & {
      code: number;
    };
    error.code = 500;

    const result = serializeError(error);

    expect(result.message).toBe("Error with numeric code");
    expect(result.code).toBe(500);
  });

  it("should handle circular references", () => {
    const error = new Error("Circular error") as Error & { self: unknown };
    error.self = error;

    const result = serializeError(error);

    expect(result.message).toBe("Circular error");
    expect(result.name).toBe("Error");
    expect(result.metadata?.self).toEqual({
      message: "[Circular Reference]",
      name: "CircularReferenceError",
    });
  });

  it("should handle nested error causes", () => {
    const cause = new Error("Root cause");
    const error = new Error("Main error", { cause });

    const result = serializeError(error);

    expect(result.message).toBe("Main error");
    expect(result.metadata?.cause).toEqual({
      name: "Error",
      message: "Root cause",
      stack: expect.any(String),
    });
  });

  it("should handle non-Error objects", () => {
    const obj = {
      name: "CustomError",
      message: "Object error",
      custom: "value",
    };
    const result = serializeError(obj);

    expect(result.message).toBe("Object error");
    expect(result.name).toBe("CustomError");
    expect(result.metadata).toEqual({
      custom: "value",
    });
  });

  it("should handle objects without standard error properties", () => {
    const obj = { custom: "value", other: 123 };
    const result = serializeError(obj);

    expect(result.name).toBe("Error");
    expect(result.message).toBe("[object Object]");
    expect(result.metadata).toEqual({
      custom: "value",
      other: 123,
    });
  });

  it("should handle primitive values", () => {
    expect(serializeError("string error")).toEqual({
      message: "string error",
      name: "UnknownError",
    });

    expect(serializeError(123)).toEqual({
      message: "123",
      name: "UnknownError",
    });

    expect(serializeError(true)).toEqual({
      message: "true",
      name: "UnknownError",
    });
  });

  it("should handle null and undefined", () => {
    expect(serializeError(null)).toEqual({
      message: "null",
      name: "UnknownError",
    });

    expect(serializeError(undefined)).toEqual({
      message: "undefined",
      name: "UnknownError",
    });
  });

  it("should skip function and symbol properties", () => {
    const error = new Error("Test") as Error & {
      fn: () => void;
      sym: symbol;
      valid: string;
    };
    error.fn = () => {};
    error.sym = Symbol("test");
    error.valid = "included";

    const result = serializeError(error);

    expect(result.metadata).toEqual({
      valid: "included",
    });
    expect(result.metadata).not.toHaveProperty("fn");
    expect(result.metadata).not.toHaveProperty("sym");
  });

  it("should handle deeply nested causes", () => {
    const rootCause = new Error("Root");
    const middleCause = new Error("Middle", { cause: rootCause });
    const error = new Error("Top", { cause: middleCause });

    const result = serializeError(error);

    expect(result.message).toBe("Top");
    expect(result.metadata?.cause).toMatchObject({
      name: "Error",
      message: "Middle",
    });
    const middleMetadata = result.metadata?.cause as {
      metadata?: { cause?: unknown };
    };
    expect(middleMetadata?.metadata?.cause).toMatchObject({
      name: "Error",
      message: "Root",
    });
  });

  it("should handle custom Error classes", () => {
    class CustomError extends Error {
      constructor(
        message: string,
        public readonly code: string,
      ) {
        super(message);
        this.name = "CustomError";
      }
    }

    const error = new CustomError("Custom message", "CUSTOM_001");
    const result = serializeError(error);

    expect(result.message).toBe("Custom message");
    expect(result.name).toBe("CustomError");
    expect(result.metadata).toEqual({
      code: "CUSTOM_001",
    });
  });

  it("should handle TypeError instances", () => {
    const error = new TypeError("Type mismatch");
    const result = serializeError(error);

    expect(result.message).toBe("Type mismatch");
    expect(result.name).toBe("TypeError");
    expect(result.stack).toBeDefined();
  });

  it("should handle RangeError instances", () => {
    const error = new RangeError("Value out of range");
    const result = serializeError(error);

    expect(result.message).toBe("Value out of range");
    expect(result.name).toBe("RangeError");
    expect(result.stack).toBeDefined();
  });

  it("should handle non-serializable custom properties", () => {
    const error = new Error("Complex error") as Error & {
      bigint: bigint;
      valid: string;
    };
    error.bigint = BigInt(123);
    error.valid = "test";

    const result = serializeError(error);

    expect(result.message).toBe("Complex error");
    expect(result.metadata).toEqual({
      valid: "test",
    });
    expect(result.metadata).not.toHaveProperty("bigint");
  });

  it("should not add metadata if no custom properties exist", () => {
    const error = new Error("Simple error");
    const result = serializeError(error);

    expect(result.message).toBe("Simple error");
    expect(result.name).toBe("Error");
    expect(result.stack).toBeDefined();
    expect(result.metadata).toBeUndefined();
  });

  it("should handle errors with only code property", () => {
    const error = new Error("Error with only code") as Error & { code: string };
    error.code = "TEST_CODE";

    const result = serializeError(error);

    expect(result.code).toBe("TEST_CODE");
    expect(result.metadata).toBeUndefined();
  });

  it("should handle complex circular object references", () => {
    const error = new Error("Complex circular") as Error & {
      obj: { parent: unknown; child: { grandchild: unknown } };
    };
    const obj = { parent: error, child: { grandchild: null as unknown } };
    obj.child.grandchild = obj;
    error.obj = obj;

    const result = serializeError(error);

    expect(result.message).toBe("Complex circular");
    expect(result.metadata?.obj).toBeDefined();
    // The circular references should be handled without throwing
  });
});
