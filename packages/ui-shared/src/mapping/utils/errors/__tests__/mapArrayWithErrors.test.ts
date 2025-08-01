import { mapArrayWithErrors } from "../mapArrayWithErrors";
import { MappingResult } from "../MappingResult";
import { createMappingError } from "../createMappingError";
import { isSuccess, isError } from "../index";

describe("mapArrayWithErrors", () => {
  const safeDouble = (n: number): MappingResult<number> =>
    n < 0
      ? {
          success: false,
          error: createMappingError("Negative number not allowed", "value", n),
        }
      : { success: true, data: n * 2 };

  const safeSquare = (n: number, index: number): MappingResult<number> =>
    n > 10
      ? {
          success: false,
          error: createMappingError(
            `Value too large at index ${index}`,
            `index_${index}`,
            n,
          ),
        }
      : { success: true, data: n * n };

  it("should map all valid items successfully", () => {
    const mapper = mapArrayWithErrors(safeDouble);
    const result = mapper([1, 2, 3, 4]);

    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toEqual([2, 4, 6, 8]);
    }
  });

  it("should return first error when stopOnError is false (default)", () => {
    const mapper = mapArrayWithErrors(safeDouble);
    const result = mapper([1, -2, 3, -4]);

    expect(isError(result)).toBe(true);
    if (isError(result)) {
      expect(result.error.message).toBe("Negative number not allowed");
      expect(result.error.field).toBe("value");
      expect(result.error.value).toBe(-2);
    }
  });

  it("should stop on first error when stopOnError is true", () => {
    const mapper = mapArrayWithErrors(safeDouble, true);
    const result = mapper([1, -2, 3, -4]);

    expect(isError(result)).toBe(true);
    if (isError(result)) {
      expect(result.error.message).toBe(
        "Array mapping failed at index 1: Negative number not allowed",
      );
      expect(result.error.field).toBe("index_1");
      expect(result.error.value).toBe(-2);
      expect(result.error.cause).toBeDefined();
    }
  });

  it("should include index in mapper calls", () => {
    const indexAwareMapper = jest.fn(
      (n: number, i: number): MappingResult<number> => ({
        success: true,
        data: n + i,
      }),
    );

    const mapper = mapArrayWithErrors(indexAwareMapper);
    const result = mapper([10, 20, 30]);

    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toEqual([10, 21, 32]); // [10+0, 20+1, 30+2]
    }

    expect(indexAwareMapper).toHaveBeenCalledWith(10, 0);
    expect(indexAwareMapper).toHaveBeenCalledWith(20, 1);
    expect(indexAwareMapper).toHaveBeenCalledWith(30, 2);
  });

  it("should handle empty arrays", () => {
    const mapper = mapArrayWithErrors(safeDouble);
    const result = mapper([]);

    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toEqual([]);
    }
  });

  it("should work with different input/output types", () => {
    const stringToLength = (s: string): MappingResult<number> =>
      s.length === 0
        ? { success: false, error: createMappingError("Empty string") }
        : { success: true, data: s.length };

    const mapper = mapArrayWithErrors(stringToLength);
    const result = mapper(["hello", "world", "test"]);

    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toEqual([5, 5, 4]);
    }
  });

  it("should fail on empty string with appropriate error", () => {
    const stringToLength = (s: string): MappingResult<number> =>
      s.length === 0
        ? { success: false, error: createMappingError("Empty string") }
        : { success: true, data: s.length };

    const mapper = mapArrayWithErrors(stringToLength, true);
    const result = mapper(["hello", "", "world"]);

    expect(isError(result)).toBe(true);
    if (isError(result)) {
      expect(result.error.message).toBe(
        "Array mapping failed at index 1: Empty string",
      );
      expect(result.error.field).toBe("index_1");
    }
  });

  it("should use the mapper with index parameter correctly", () => {
    const result = mapArrayWithErrors(safeSquare)([1, 2, 3]);

    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toEqual([1, 4, 9]);
    }
  });

  it("should fail with index-aware error message", () => {
    const result = mapArrayWithErrors(safeSquare, true)([5, 15, 3]);

    expect(isError(result)).toBe(true);
    if (isError(result)) {
      expect(result.error.message).toBe(
        "Array mapping failed at index 1: Value too large at index 1",
      );
      expect(result.error.field).toBe("index_1");
      expect(result.error.value).toBe(15);
    }
  });

  it("should handle single item arrays", () => {
    const mapper = mapArrayWithErrors(safeDouble);

    const validResult = mapper([5]);
    expect(isSuccess(validResult)).toBe(true);
    if (isSuccess(validResult)) {
      expect(validResult.data).toEqual([10]);
    }

    const invalidResult = mapper([-5]);
    expect(isError(invalidResult)).toBe(true);
    if (isError(invalidResult)) {
      expect(invalidResult.error.message).toBe("Negative number not allowed");
    }
  });

  it("should process all items before first error when stopOnError is false", () => {
    const processedIndices: number[] = [];
    const trackingMapper = (
      n: number,
      index: number,
    ): MappingResult<number> => {
      processedIndices.push(index);
      return safeDouble(n);
    };

    const mapper = mapArrayWithErrors(trackingMapper, false);
    mapper([1, -2, 3, 4]); // Should stop at index 1

    expect(processedIndices).toEqual([0, 1]); // Should stop after first error
  });

  it("should process all items when stopOnError is true until error", () => {
    const processedIndices: number[] = [];
    const trackingMapper = (
      n: number,
      index: number,
    ): MappingResult<number> => {
      processedIndices.push(index);
      return safeDouble(n);
    };

    const mapper = mapArrayWithErrors(trackingMapper, true);
    mapper([1, -2, 3, 4]); // Should stop at index 1

    expect(processedIndices).toEqual([0, 1]); // Should stop after first error
  });
});
