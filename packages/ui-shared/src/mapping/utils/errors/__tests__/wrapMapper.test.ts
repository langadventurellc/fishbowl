import { wrapMapper } from "../wrapMapper";
import { isSuccess, isError } from "../index";
import { MappingError } from "../MappingError";

describe("wrapMapper", () => {
  it("should return successful result for normal mapper", () => {
    const mapper = (x: number) => x * 2;
    const wrapped = wrapMapper(mapper);

    const result = wrapped(5);

    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toBe(10);
    }
  });

  it("should catch and wrap generic errors", () => {
    const mapper = (_: number) => {
      throw new Error("Calculation failed");
    };
    const wrapped = wrapMapper(mapper);

    const result = wrapped(5);

    expect(isError(result)).toBe(true);
    if (isError(result)) {
      expect(result.error.message).toBe("Calculation failed");
      expect(result.error.value).toBe(5);
      expect(result.error.cause).toBeInstanceOf(Error);
    }
  });

  it("should preserve MappingError instances", () => {
    const originalError = new MappingError(
      "Custom mapping error",
      "testField",
      42,
    );
    const mapper = (_: number) => {
      throw originalError;
    };
    const wrapped = wrapMapper(mapper);

    const result = wrapped(10);

    expect(isError(result)).toBe(true);
    if (isError(result)) {
      expect(result.error).toBe(originalError);
      expect(result.error.message).toBe("Custom mapping error");
      expect(result.error.field).toBe("testField");
      expect(result.error.value).toBe(42);
    }
  });

  it("should handle non-Error throws", () => {
    const mapper = (_: number) => {
      throw "String error";
    };
    const wrapped = wrapMapper(mapper);

    const result = wrapped(5);

    expect(isError(result)).toBe(true);
    if (isError(result)) {
      expect(result.error.message).toBe("Unknown mapping error");
      expect(result.error.value).toBe(5);
      expect(result.error.cause).toBeUndefined();
    }
  });

  it("should handle object throws", () => {
    const mapper = (_: number) => {
      throw { message: "Object error" };
    };
    const wrapped = wrapMapper(mapper);

    const result = wrapped(5);

    expect(isError(result)).toBe(true);
    if (isError(result)) {
      expect(result.error.message).toBe("Unknown mapping error");
      expect(result.error.value).toBe(5);
      expect(result.error.cause).toBeUndefined();
    }
  });

  it("should work with different input/output types", () => {
    const mapper = (input: { name: string }) => input.name.toUpperCase();
    const wrapped = wrapMapper(mapper);

    const result = wrapped({ name: "john" });

    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toBe("JOHN");
    }
  });

  it("should handle complex return types", () => {
    const mapper = (x: number) => ({
      value: x,
      doubled: x * 2,
      isEven: x % 2 === 0,
    });
    const wrapped = wrapMapper(mapper);

    const result = wrapped(4);

    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toEqual({ value: 4, doubled: 8, isEven: true });
    }
  });
});
